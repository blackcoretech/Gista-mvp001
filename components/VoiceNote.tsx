"use client";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
type VoiceNoteProps = { src: string; durationHint?: number | null };
function formatTime(value:number){const n=Math.max(0,Math.floor(value));return Math.floor(n/60)+":"+String(n%60).padStart(2,"0");}
export default function VoiceNote({src,durationHint}:VoiceNoteProps){
 const audioRef=useRef<HTMLAudioElement|null>(null);const[playing,setPlaying]=useState(false);const[current,setCurrent]=useState(0);const[duration,setDuration]=useState(durationHint??0);
 useEffect(()=>{const a=audioRef.current;if(!a)return;const time=()=>setCurrent(a.currentTime);const loaded=()=>setDuration(Number.isFinite(a.duration)?a.duration:(durationHint??0));const ended=()=>{setPlaying(false);setCurrent(0)};const paused=()=>setPlaying(false);a.addEventListener("timeupdate",time);a.addEventListener("loadedmetadata",loaded);a.addEventListener("ended",ended);a.addEventListener("pause",paused);return()=>{a.removeEventListener("timeupdate",time);a.removeEventListener("loadedmetadata",loaded);a.removeEventListener("ended",ended);a.removeEventListener("pause",paused)}},[durationHint,src]);
 const bars=useMemo(()=>Array.from({length:40},(_,i)=>20+((i*17+i*i*3)%64)),[]);
 function toggle(){const a=audioRef.current;if(!a)return;if(a.paused)void a.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));else{a.pause();setPlaying(false)}}
 function seek(e:MouseEvent<HTMLDivElement>){const a=audioRef.current,total=duration||durationHint||0;if(!a||!total)return;const r=e.currentTarget.getBoundingClientRect();a.currentTime=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width))*total;setCurrent(a.currentTime)}
 const total=duration||durationHint||0,progress=total?Math.min(1,current/total):0;
 return <div className={playing?"voice-note voice-note-playing":"voice-note"}><button className="voice-play" type="button" onClick={toggle} aria-label={playing?"Pause voice post":"Play voice post"}>{playing?<Pause size={22} fill="currentColor"/>:<Play size={22} fill="currentColor"/>}</button><div className="voice-track-wrap"><div className="voice-track" onClick={seek} role="slider" aria-label="Voice post progress" aria-valuemin={0} aria-valuemax={Math.round(total)} aria-valuenow={Math.round(current)}>{bars.map((h,i)=><span key={i} className={i/bars.length<=progress?"voice-bar played":"voice-bar"} style={{height:h+"%"}}/>)}</div><div className="voice-time"><span>{formatTime(current)}</span><strong>{formatTime(total)}</strong></div></div><audio ref={audioRef} src={src} preload="metadata"/></div>;
}
