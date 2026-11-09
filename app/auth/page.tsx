"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { safeInternalPath } from "@/lib/safe-redirect";

const TERMS_VERSION = "0.1-draft";
const PRIVACY_VERSION = "0.1-draft";

export default function AuthPage(){
  const router=useRouter();
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [acceptedLegal,setAcceptedLegal]=useState(false);
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);
  const [returnTo,setReturnTo]=useState("/");
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const requestedMode=params.get("mode");
    if(requestedMode==="signup"||requestedMode==="login")setMode(requestedMode);
    const next=params.get("returnTo");
    if(next)setReturnTo(safeInternalPath(next));
    const error=params.get("error");
    if(error==="verification_failed")setMessage("Email verification failed or the link has expired. Please request a new verification email.");
    else if(error==="missing_verification_token")setMessage("This verification link is incomplete. Please request a new verification email.");
  },[]);
  function goBack(){const destination=safeInternalPath(returnTo);router.replace(destination);router.refresh();}
  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(mode==="signup"&&!acceptedLegal){setMessage("Please agree to the Terms of Service and acknowledge the Privacy Policy before creating your account.");return;}
    setLoading(true);setMessage("");
    const supabase=createClient();
    if(mode==="login"){
      const result=await supabase.auth.signInWithPassword({email,password});
      if(result.error)setMessage(result.error.message);
      else{setMessage("Signed in.");goBack();}
    }else{
      const emailRedirectTo=`${window.location.origin}/auth/confirm?next=${encodeURIComponent(safeInternalPath(returnTo))}`;
      const acceptedAt=new Date().toISOString();
      const result=await supabase.auth.signUp({
        email,password,
        options:{
          emailRedirectTo,
          data:{
            gista_terms_accepted_at:acceptedAt,
            gista_terms_version:TERMS_VERSION,
            gista_privacy_acknowledged_at:acceptedAt,
            gista_privacy_version:PRIVACY_VERSION
          }
        }
      });
      if(result.error)setMessage(result.error.message);
      else if(result.data.session){setMessage("Account created.");goBack();}
      else setMessage("Check your email to verify your account. You’ll return to the Post after verification.");
    }
    setLoading(false);
  }
  const hasReturnPost=returnTo.startsWith("/post/");
  return <main className="auth-page"><div className="auth-card">
    {hasReturnPost&&<button type="button" className="switch" onClick={()=>router.replace(returnTo)}>← Back to Post</button>}
    <div className="brand auth-brand"><div className="brand-icon">G</div><span>Gista</span></div>
    <h1>{mode==="login"?"Welcome back":"Create your account"}</h1>
    <p>Come talk. Express yourself. Join the conversation.</p>
    {mode==="signup"&&<div className="signup-steps" aria-label="Getting started"><span><b>1</b> Create account</span><i>→</i><span><b>2</b> Set up profile</span><i>→</i><span><b>3</b> Start talking</span></div>}
    <form onSubmit={submit}>
      <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label>Password<div style={{position:"relative"}}><input type={showPassword?"text":"password"} required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} style={{paddingRight:48}}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"} title={showPassword?"Hide password":"Show password"} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",width:36,height:36,display:"grid",placeItems:"center",border:0,background:"transparent",color:"#77727f",cursor:"pointer"}}>{showPassword?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>
      {mode==="signup"&&<label style={{display:"flex",alignItems:"flex-start",gap:10,fontSize:13,lineHeight:1.55,fontWeight:500,margin:"4px 0 14px"}}>
        <input type="checkbox" required checked={acceptedLegal} onChange={e=>setAcceptedLegal(e.target.checked)} style={{width:18,height:18,marginTop:2,flex:"0 0 auto",accentColor:"#6d28d9"}}/>
        <span>I agree to Gista&apos;s <Link href="/terms" target="_blank" style={{color:"#6d28d9",fontWeight:750,textDecoration:"underline"}}>Terms of Service</Link> and acknowledge that I have read the <Link href="/privacy" target="_blank" style={{color:"#6d28d9",fontWeight:750,textDecoration:"underline"}}>Privacy Policy</Link>.</span>
      </label>}
      <button className="primary" disabled={loading}>{loading?"Please wait…":mode==="login"?"Log in":"Sign up"}</button>
    </form>
    {message&&<div className="auth-message" role="status">{message}</div>}
    <button className="switch" onClick={()=>{setMode(mode==="login"?"signup":"login");setAcceptedLegal(false);setMessage("");}}>{mode==="login"?"New to Gista? Create an account":"Already have an account? Log in"}</button>
    <Link className="forgot" href="/auth/forgot-password">Forgot password?</Link>
  </div></main>;
}
