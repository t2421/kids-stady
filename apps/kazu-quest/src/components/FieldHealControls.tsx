"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MemberStatus, StatusData } from "@/game/field/statusSections";
import { autosave, getSave, updateSave } from "@/game/session";
import { requestFieldSpellMath } from "@/game/battle/mathRequest";
import { getSpell } from "@/content/spells";
import { memberName } from "@/lib/battle/members";
import {
  applyFieldHeal,
  applyHealItem,
  canCastFieldHeal,
  type Healed,
} from "@/lib/field/recover";
import { UI_COLORS } from "@/components/uiTheme";
/* Phaser 非依存の音モジュールなので React から直接 import してよい (sfx.ts 冒頭参照) */
import { playSfx } from "@/game/audio/sfx";

/*
 * ステータスパネルの じゅもん / もちもの タブ本体 + フィールド回復 (戦闘外)。
 *   - kind "heal" の呪文・アイテムに「つかう」を出す (≥56px、タップ完結)
 *   - 単体対象は なかまを選ぶ (HP バー付き)。target "party" の呪文は選ばず全員
 *   - アイテムは即時。呪文は算数 1 問 (EventBus "math-prompt" context "field"、時間無制限)
 *     正解で回復 + MP 消費、不正解は MP も HP も変わらない (戦闘の不発と同じ)
 *   - 出題中は onPendingChange(true) で親 (StatusPanelOverlay) が とじる を封じる
 * 純ロジックは lib/field/recover.ts。ここは表示と EventBus の往復だけ。
 */

const TOAST_MS = 3000;

type Picker = { kind: "spell"; spellId: string } | { kind: "item"; itemId: string };

interface Props {
  data: StatusData;
  /* じゅもんタブで選ばれている なかま (使い手) */
  member: MemberStatus;
  mode: "spells" | "items";
  /* セーブが変わった (回復・まちがいノート) → 親がパネルの表示データを組み直す */
  onChanged: () => void;
  onPendingChange: (pending: boolean) => void;
}

const lineFont: React.CSSProperties = {
  fontFamily: "var(--kids-font)",
  fontSize: "clamp(16px, 2.3vw, 21px)",
  color: "#ffffff",
};

const actionStyle = (enabled: boolean): React.CSSProperties => ({
  minHeight: 56,
  minWidth: 120,
  padding: "8px 18px",
  fontFamily: "var(--kids-font)",
  fontSize: "clamp(15px, 2vw, 19px)",
  fontWeight: 700,
  color: enabled ? UI_COLORS.navy : UI_COLORS.textSub,
  background: enabled ? UI_COLORS.hp : "rgba(255,255,255,0.08)",
  border: enabled ? "3px solid #ffffff" : "3px solid rgba(255,255,255,0.3)",
  borderRadius: 12,
  cursor: enabled ? "pointer" : "default",
});

function healText(healed: Healed[]): string {
  const lines = healed
    .filter((h) => h.amount > 0)
    .map((h) => `${memberName(h.memberId)}の HPが ${h.amount} かいふくした!`);
  return lines.length > 0 ? lines.join(" ") : "HPは もう まんたんだ";
}

export const FIZZLE_TEXT = "じゅもんが みだれた! (MPは へらない)";

function HpBar({ value, max }: { value: number; max: number }) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div style={{ height: 12, borderRadius: 6, background: "#2a2a34", overflow: "hidden" }}>
      <div
        style={{ width: `${ratio * 100}%`, height: "100%", borderRadius: 6, background: UI_COLORS.hp }}
      />
    </div>
  );
}

export function FieldHealControls({ data, member, mode, onChanged, onPendingChange }: Props) {
  const [picker, setPicker] = useState<Picker | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  /* タブ・なかまが変わったら選択中の対象は捨てる */
  useEffect(() => {
    setPicker(null);
  }, [mode, member.memberId]);

  useEffect(() => {
    if (toast === null) return;
    const t = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(t);
  }, [toast]);

  const markPending = useCallback(
    (v: boolean) => {
      pendingRef.current = v;
      setPending(v);
      onPendingChange(v);
    },
    [onPendingChange],
  );

  const finishHeal = useCallback(
    (healed: Healed[]) => {
      playSfx("heal");
      setToast(healText(healed));
      onChanged();
    },
    [onChanged],
  );

  const healWithItem = (itemId: string, targetId: string) => {
    setPicker(null);
    const r = applyHealItem(getSave(), itemId, targetId);
    updateSave(() => r.save);
    autosave();
    finishHeal(r.healed);
  };

  const castSpell = (spellId: string, targetId: string | null) => {
    const spell = getSpell(spellId);
    if (!spell || pendingRef.current) return;
    const casterId = member.memberId;
    setPicker(null);
    markPending(true);
    requestFieldSpellMath(spell.skillIds, (correct) => {
      if (correct) {
        const r = applyFieldHeal(getSave(), casterId, spellId, targetId);
        updateSave(() => r.save);
        autosave();
        finishHeal(r.healed);
      } else {
        /* まちがいノートが増えているので表示を組み直す (MP/HP は不変) */
        setToast(FIZZLE_TEXT);
        onChanged();
      }
      markPending(false);
    });
  };

  const targets = data.members.filter((m) => m.hp < m.maxHp);
  const nobodyHurt = targets.length === 0;

  /* 全体回復の呪文だけ なかま選びを飛ばす。単体は 1 人しかいなくても選ばせる (誤タップ防止) */
  const pick = (p: Picker) => {
    if (p.kind === "spell" && getSpell(p.spellId)?.target === "party") {
      castSpell(p.spellId, null);
      return;
    }
    setPicker(p);
  };

  const rows = mode === "spells" ? member.spells : data.items;

  return (
    <div style={{ padding: "4px 10px", display: "flex", flexDirection: "column", gap: 12 }}>
      {toast !== null && (
        <div
          data-testid="heal-result"
          role="status"
          style={{
            ...lineFont,
            textAlign: "center",
            color: UI_COLORS.yellow,
            fontWeight: 700,
            border: `2px solid ${UI_COLORS.accent}`,
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          {toast}
        </div>
      )}

      {picker !== null ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...lineFont, fontWeight: 700, color: UI_COLORS.yellow }}>
            だれに つかう?
          </div>
          {targets.map((t) => (
            <button
              key={t.memberId}
              data-testid="heal-target"
              data-member={t.memberId}
              style={{
                ...lineFont,
                minHeight: 64,
                textAlign: "left",
                padding: "10px 18px",
                background: "rgba(255,255,255,0.08)",
                border: "3px solid rgba(255,255,255,0.45)",
                borderRadius: 12,
                cursor: "pointer",
              }}
              onClick={() =>
                picker.kind === "spell"
                  ? castSpell(picker.spellId, t.memberId)
                  : healWithItem(picker.itemId, t.memberId)
              }
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>{t.name}</span>
                <span>
                  HP {t.hp}/{t.maxHp}
                </span>
              </div>
              <HpBar value={t.hp} max={t.maxHp} />
            </button>
          ))}
          <button
            data-testid="heal-cancel"
            style={{ ...actionStyle(true), background: UI_COLORS.navy, color: "#ffffff", alignSelf: "flex-start" }}
            onClick={() => setPicker(null)}
          >
            やめる
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div style={{ ...lineFont, textAlign: "center", marginTop: 40 }}>
          {mode === "spells"
            ? "まだ おぼえていない。まなびやで テストに ちょうせん しよう!"
            : "なにも もっていない。"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mode === "spells"
            ? member.spells.map((s) => {
                const check = canCastFieldHeal(getSave(), member.memberId, s.id);
                const reason =
                  s.kind !== "heal"
                    ? null
                    : !check.ok && check.reason === "noMp"
                      ? "MPが たりない"
                      : nobodyHurt
                        ? "みんな げんき"
                        : "";
                return (
                  <Row key={s.id} label={`${s.name} MP${s.mpCost}`}>
                    {reason !== null && (
                      <UseButton
                        testId="spell-use"
                        dataId={s.id}
                        reason={reason}
                        disabled={pending || reason !== ""}
                        onTap={() => pick({ kind: "spell", spellId: s.id })}
                      />
                    )}
                  </Row>
                );
              })
            : data.items.map((it) => (
                <Row key={it.id} label={`${it.name} ×${it.count}`}>
                  {it.kind === "heal" && (
                    <UseButton
                      testId="item-use"
                      dataId={it.id}
                      reason={nobodyHurt ? "みんな げんき" : ""}
                      disabled={pending || nobodyHurt}
                      onTap={() => pick({ kind: "item", itemId: it.id })}
                    />
                  )}
                </Row>
              ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        minHeight: 56,
        padding: "4px 8px",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <span style={lineFont}>{label}</span>
      {children}
    </div>
  );
}

function UseButton({
  testId,
  dataId,
  reason,
  disabled,
  onTap,
}: {
  testId: string;
  dataId: string;
  /* "" = 使える。それ以外は使えない理由をボタンの中に短く出す */
  reason: string;
  disabled: boolean;
  onTap: () => void;
}) {
  return (
    <button
      data-testid={testId}
      data-id={dataId}
      disabled={disabled}
      aria-disabled={disabled}
      style={actionStyle(!disabled)}
      onClick={onTap}
    >
      {reason === "" ? "つかう" : reason}
    </button>
  );
}
