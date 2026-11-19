"use client";
import VoiceNote from "@/components/VoiceNote";
type VoicePlayerProps={src:string;className?:string;durationHint?:number|null};
export default function VoicePlayer({src,className,durationHint}:VoicePlayerProps){return <div className={className??"voice-player"}><VoiceNote src={src} durationHint={durationHint}/></div>}
