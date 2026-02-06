"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/InputText";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/TabsLogin";
import RememberMeCheckbox from "@/components/ui/RememberMeCheckbox";
import SigninSubmitButton from "@/components/ui/SigninSubmitButton";
import SignupSubmitButton from "@/components/ui/SignupSubmitButton";
import { Loader2, Eye, EyeOff } from "lucide-react"; 

// --- SUB-COMPONENT: Password Input dengan Toggle ---
const PasswordInput = ({ id, name, placeholder, required = false, minLength = 0 }: any) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative group">
      <Input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="py-6 pr-12 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-400"
      />
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1 rounded-md focus:outline-none"
        tabIndex={-1} 
      >
        {isVisible ? (
          <EyeOff className="h-5 w-5" strokeWidth={2.5} />
        ) : (
          <Eye className="h-5 w-5" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Auth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Registrasi berhasil! Silakan login.");
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("full-name") as string;
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan saat registrasi");
        setIsLoading(false);
        return;
      }

      setSuccess("Registrasi berhasil! Silakan login.");
      (e.target as HTMLFormElement).reset();
      
      setTimeout(() => {
        const signinButton = document.querySelector('[value="signin"]') as HTMLElement;
        if (signinButton) signinButton.click();
      }, 500);
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
        setIsLoading(false);
      } else if (result?.ok) {
        setSuccess("Login berhasil! Mengalihkan...");
        
        const response = await fetch("/api/users/profile");
        const userData = await response.json();
        
        let redirectUrl = "/overview";
        if (userData.role === "ADMIN") redirectUrl = "/admin";
        else if (userData.role === "INSTRUCTOR") redirectUrl = "/instructor";
        
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center overflow-hidden bg-white" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}>
      
      <div className="flex flex-1 items-center justify-center px-4 py-8 relative z-10 w-full min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl items-center">
    
          {/* Card Form dengan Shadow Cartoon Professional */}
          <div className="relative mx-auto w-full max-w-md">
            {/* Shadow Layer - Cartoon Style */}
            <div className="absolute inset-0 bg-black/10 rounded-[2rem] blur-2xl transform translate-y-3 -z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/10 to-teal-400/10 rounded-[2rem] blur-xl -z-10" />
            
            <div className="bg-white/95 rounded-[2rem] p-6 sm:p-10 flex flex-col justify-center w-full border-2 border-slate-100 backdrop-blur-md relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            
            {/* Bagian garis hijau di sini SUDAH DIHAPUS */}

            <div className="flex flex-col items-center gap-2 mb-8">
              <img src="/logo.png" alt="IRMA Verse" className="h-12 w-12 object-contain hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="font-black text-3xl text-emerald-600 tracking-tight">IRMA Verse</div>
                <div className="text-sm text-slate-400 font-bold tracking-wide uppercase">Platform Rohis Digital</div>
              </div>
            </div>
            
            <h2 className="text-2xl font-black mb-2 text-slate-800 text-center">Selamat Datang!</h2>
            <p className="text-slate-500 mb-8 text-center text-sm font-medium">Ayo lanjutkan perjalanan spiritualmu.</p>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 p-0.5 bg-slate-200 rounded-3xl gap-0.5">
                <TabsTrigger value="signin" className="rounded-2xl py-3 px-4 font-black text-base transition-all hover:scale-105 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-slate-600 text-slate-600">Masuk</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-2xl py-3 px-4 font-black text-base transition-all hover:scale-105 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-slate-600 text-slate-600">Daftar</TabsTrigger>
              </TabsList>

              {/* === FORM SIGN IN === */}
              <TabsContent value="signin" className="animate-in fade-in-50 zoom-in-95 duration-300">
                <form onSubmit={handleSignIn} className="space-y-5">
                  {error && <div className="rounded-xl bg-red-50 p-4 border-2 border-red-100 text-center"><p className="text-sm text-red-600 font-bold">{error}</p></div>}
                  {success && <div className="rounded-xl bg-emerald-50 p-4 border-2 border-emerald-100 text-center"><p className="text-sm text-emerald-600 font-bold">{success}</p></div>}
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-slate-600 font-bold text-sm ml-1">Email</Label>
                    <Input
                        id="signin-email"
                        name="signin-email"
                        type="email"
                        placeholder="contoh@sekolah.sch.id"
                        required
                        className="py-6 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-slate-600 font-bold text-sm ml-1">Kata Sandi</Label>
                    <PasswordInput 
                      id="signin-password"
                      name="signin-password"
                      placeholder="••••••••"
                      required={true}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm mt-2">
                    <RememberMeCheckbox />
                    <a href="#" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">Lupa sandi?</a>
                  </div>

                  <SigninSubmitButton isLoading={isLoading} />
                </form>
              </TabsContent>

              {/* === FORM SIGN UP === */}
              <TabsContent value="signup" className="animate-in fade-in-50 zoom-in-95 duration-300">
                <form onSubmit={handleSignUp} className="space-y-5">
                  {error && <div className="rounded-xl bg-red-50 p-4 border-2 border-red-100 text-center"><p className="text-sm text-red-600 font-bold">{error}</p></div>}
                  {success && <div className="rounded-xl bg-emerald-50 p-4 border-2 border-emerald-100 text-center"><p className="text-sm text-emerald-600 font-bold">{success}</p></div>}
                  
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-slate-600 font-bold text-sm ml-1">Nama Lengkap</Label>
                    <Input
                        id="full-name"
                        name="full-name"
                        type="text"
                        placeholder="Nama Lengkap"
                        required
                        className="py-6 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-slate-600 font-bold text-sm ml-1">Email</Label>
                    <Input
                        id="signup-email"
                        name="signup-email"
                        type="email"
                        placeholder="nama@email.com"
                        required
                        className="py-6 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-slate-600 font-bold text-sm ml-1">Kata Sandi</Label>
                    <PasswordInput 
                      id="signup-password"
                      name="signup-password"
                      placeholder="Minimal 6 karakter"
                      required={true}
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-600 font-bold text-sm ml-1">Konfirmasi Kata Sandi</Label>
                    <PasswordInput 
                      id="confirm-password"
                      name="confirm-password"
                      placeholder="Ulangi kata sandi"
                      required={true}
                      minLength={6}
                    />
                  </div>

                  <SignupSubmitButton isLoading={isLoading} />
                </form>
              </TabsContent>
            </Tabs>
            </div>
          </div>

          {/* Side Illustration Text (Desktop) */}
          <div className="hidden md:flex flex-col justify-center items-center text-center px-6">
            <div className="mb-10 relative transform hover:scale-105 transition-transform duration-500">
              <svg width="280" height="160" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="110" cy="90" rx="60" ry="30" fill="#14b8a6" fillOpacity="0.2" />
                <rect x="90" y="60" width="40" height="40" rx="12" fill="white" stroke="#10b981" strokeWidth="3" />
                <circle cx="110" cy="80" r="14" stroke="#10b981" strokeWidth="3" fill="white" />
                <path d="M105 80 L110 85 L115 75" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="60" cy="60" r="4" fill="#34d399" />
                <circle cx="160" cy="60" r="6" fill="#34d399" fillOpacity="0.6" />
                <circle cx="110" cy="40" r="8" fill="#34d399" fillOpacity="0.4" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Komunitas Islami Modern</h3>
              <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                Kelola aktivitas rohis, kajian, dan event islami sekolah dengan cara yang lebih <span className="text-emerald-600 font-bold underline decoration-wavy">menyenangkan</span> dan terorganisir.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    }>
      <Auth />
    </Suspense>
  );
}