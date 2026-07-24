"use client";

import { useEffect, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { setActiveProfileId } from "@/game/session";
import {
  AVATARS,
  createProfile,
  deleteProfile,
  listProfiles,
  setActiveId,
  type Profile,
} from "@/lib/profiles";
import { removeLearning } from "@/lib/learning";
import { removeSave } from "@/lib/save";

type View = "select" | "create" | "hidden";

/*
 * 起動時に「だれが あそぶ?」を出すプレイヤー選択オーバーレイ。
 * 選択すると Phaser 側へ profile-selected を通知して閉じる。
 * ゲーム内の「プレイヤーへんこう」からは request-profile-select で再表示。
 */
export function ProfileGate() {
  const [view, setView] = useState<View>("select");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [deleteArmedId, setDeleteArmedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);

  useEffect(() => {
    setProfiles(listProfiles());
  }, [view]);

  useEffect(() => {
    const reopen = () => {
      setActiveProfileId(null);
      setDeleteArmedId(null);
      setView("select");
    };
    EventBus.on("request-profile-select", reopen);
    return () => {
      EventBus.off("request-profile-select", reopen);
    };
  }, []);

  function select(id: string) {
    setActiveId(id);
    setActiveProfileId(id);
    setView("hidden");
    EventBus.emit("profile-selected", id);
  }

  function onDeleteTap(id: string) {
    if (deleteArmedId === id) {
      deleteProfile(id);
      removeSave(id);
      removeLearning(id);
      setDeleteArmedId(null);
      setProfiles(listProfiles());
    } else {
      setDeleteArmedId(id);
    }
  }

  function onCreate() {
    const id = createProfile(name.trim() || "プレイヤー", avatar);
    setName("");
    select(id);
  }

  if (view === "hidden") return null;

  if (view === "create") {
    return (
      <div className="overlay">
        <h1>
          あたらしい <span className="em">プレイヤー</span>
        </h1>
        <div className="avatar-picker">
          {AVATARS.map((a) => (
            <button
              key={a}
              className={"avatar-opt" + (a === avatar ? " sel" : "")}
              onClick={() => setAvatar(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <input
          className="name-input"
          value={name}
          maxLength={10}
          placeholder="なまえ"
          onChange={(e) => setName(e.target.value)}
        />
        <button className="bigbtn" onClick={onCreate}>
          これで あそぶ!
        </button>
        <button className="small-btn" onClick={() => setView("select")}>
          もどる
        </button>
      </div>
    );
  }

  return (
    <div className="overlay">
      <h1>
        だれが <span className="em">あそぶ?</span>
      </h1>
      <div className="player-list">
        {profiles.map((p) => (
          <div key={p.id} className="player-card" onClick={() => select(p.id)}>
            <button
              className={"player-delete" + (deleteArmedId === p.id ? " armed" : "")}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTap(p.id);
              }}
            >
              {deleteArmedId === p.id ? "ほんとに けす?" : "×"}
            </button>
            <div className="player-avatar">{p.avatar}</div>
            <div className="player-name">{p.name}</div>
          </div>
        ))}
      </div>
      <button className="bigbtn" onClick={() => setView("create")}>
        ＋ あたらしい プレイヤー
      </button>
    </div>
  );
}
