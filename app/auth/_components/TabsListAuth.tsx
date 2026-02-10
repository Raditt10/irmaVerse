import { TabsList, TabsTrigger } from "@radix-ui/react-tabs";

export const AuthTabsList = () => {
  return (
    <TabsList className="grid grid-cols-2 gap-2 mb-8 p-1 bg-slate-100 rounded-2xl border-2 border-slate-200 h-fit mx-auto">
      <TabsTrigger 
        value="signin" 
        className="flex-1 rounded-xl py-2 px-4 font-bold text-sm transition-all data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-400 hover:text-slate-600 flex items-center justify-center"
      >
        Masuk
      </TabsTrigger>
      <TabsTrigger 
        value="signup" 
        className="flex-1 rounded-xl py-2 px-4 font-bold text-sm transition-all data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-400 hover:text-slate-600 flex items-center justify-center"
      >
        Daftar
      </TabsTrigger>
    </TabsList>
  );
};
