import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  MessageSquare,
  Linkedin,
  BriefcaseBusiness,
  Star,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onPrivacy, onTerms }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: BarChart3,
      title: "Analiza ATS",
      desc: "Szczegółowy wynik i analiza tego, jak dobrze Twoje CV przechodzi przez systemy ATS.",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: Sparkles,
      title: "Optymalizacja CV",
      desc: "Konkretne wskazówki do poprawy słów kluczowych, formatowania i opisów osiągnięć.",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: FileText,
      title: "Listy Motywacyjne",
      desc: "Generuj spersonalizowane listy motywacyjne dopasowane do konkretnej oferty pracy.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: MessageSquare,
      title: "Przygotowanie do Rozmowy",
      desc: "Ćwicz z pytaniami wygenerowanymi przez AI, specyficznymi dla stanowiska.",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Linkedin,
      title: "Audyt LinkedIn",
      desc: "Zoptymalizuj swój profil LinkedIn, aby przyciągać rekruterów i być spójnym z CV.",
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      icon: BriefcaseBusiness,
      title: "Znajdź Oferty",
      desc: "AI przeszukuje Internet i sugeruje aktualne oferty pracy dopasowane do Twojego profilu.",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  const stats = [
    { value: "95%", label: "skuteczność przejścia ATS" },
    { value: "3x", label: "więcej zaproszeń na rozmowy" },
    { value: "60s", label: "czas analizy CV" },
    { value: "6", label: "narzędzi w jednym miejscu" },
  ];

  const faqs = [
    {
      q: "Czy moje dane CV są bezpieczne?",
      a: "Tak. Twoje dane są przetwarzane wyłącznie na potrzeby analizy i nie są udostępniane osobom trzecim ani używane do trenowania modeli AI."
    },
    {
      q: "Czy potrzebuję konta, żeby korzystać z aplikacji?",
      a: "Nie — możesz korzystać z analizy CV jako gość. Konto daje dostęp do historii analiz i zapisanych preferencji."
    },
    {
      q: "Jaki format CV jest obsługiwany?",
      a: "Możesz wgrać CV w formacie PDF lub wkleić tekst bezpośrednio. Obsługujemy CV w języku polskim i angielskim."
    },
    {
      q: "Ile to kosztuje?",
      a: "Aplikacja jest bezpłatna. Wymaga jedynie własnego klucza API Google Gemini (darmowy tier wystarczy do podstawowego użycia)."
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-xl tracking-tight">CvToAI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              Zaloguj
            </button>
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-blue-200 transition-all hover:scale-105 active:scale-95"
            >
              Wypróbuj za darmo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-20 -left-40 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100"
          >
            <Sparkles size={12} />
            AI-Powered Career Assistant
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]"
          >
            Zoptymalizuj CV dla{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block sm:inline">
              maksymalnego efektu
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed"
          >
            Przestań być odrzucany przez systemy ATS. AI analizuje Twoje CV i dopasowuje je do konkretnej oferty pracy — w 60 sekund.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-base sm:text-lg hover:shadow-xl hover:shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
            >
              Analizuj moje CV
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-full font-bold text-base sm:text-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all"
            >
              Zaloguj się
            </button>
          </motion.div>

          {/* Social proof stars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-1 pt-2"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
            ))}
            <span className="text-sm text-zinc-500 ml-2">Oceniane 5/5 przez użytkowników</span>
          </motion.div>
        </div>

        {/* Mock UI preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative z-10 max-w-3xl mx-auto mt-14 px-2"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-zinc-200 border border-zinc-100 overflow-hidden">
            {/* Mock header bar */}
            <div className="bg-zinc-50 border-b border-zinc-100 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-300" />
                <div className="w-3 h-3 rounded-full bg-amber-300" />
                <div className="w-3 h-3 rounded-full bg-green-300" />
              </div>
              <div className="flex-1 mx-4 h-6 bg-white rounded-lg border border-zinc-200 flex items-center px-3">
                <span className="text-xs text-zinc-400">cvtoai.app</span>
              </div>
            </div>
            {/* Mock content */}
            <div className="p-4 sm:p-6 grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="h-3 w-24 bg-zinc-100 rounded-full" />
                <div className="h-24 bg-zinc-50 rounded-xl border border-zinc-100" />
                <div className="h-3 w-20 bg-zinc-100 rounded-full" />
                <div className="h-24 bg-zinc-50 rounded-xl border border-zinc-100" />
                <div className="h-11 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl" />
              </div>
              <div className="space-y-3">
                <div className="h-3 w-20 bg-zinc-100 rounded-full" />
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-zinc-900">87</span>
                    <span className="text-zinc-400 font-bold">%</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 size={12} /> Świetny wynik
                  </div>
                  {['Formatowanie', 'Słowa kluczowe', 'Dopasowanie'].map((label, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>{label}</span>
                        <span>{[16, 14, 18][i]}/20</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500`} style={{ width: `${[80, 70, 90][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 bg-zinc-900">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-zinc-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-24 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100 mb-4">
              Funkcje
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">Wszystko, czego potrzebujesz, żeby dostać pracę</h2>
            <p className="text-zinc-500 text-base sm:text-lg">
              Kompleksowe narzędzia AI do optymalizacji każdego etapu procesu rekrutacyjnego.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900">
              Jak to działa?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connection line (desktop only) */}
            <div className="hidden sm:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200" />
            {[
              { step: "01", title: "Wgraj CV", desc: "Wgraj CV w formacie PDF lub wklej tekst bezpośrednio.", color: "bg-blue-600" },
              { step: "02", title: "Dodaj ofertę pracy", desc: "Wklej opis stanowiska, na które aplikujesz.", color: "bg-indigo-600" },
              { step: "03", title: "Otrzymaj feedback", desc: "AI analizuje luki, słowa kluczowe i problemy z formatowaniem w sekundy.", color: "bg-purple-600" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className={`w-16 h-16 ${item.color} text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg mb-5 relative z-10`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24 bg-zinc-50 border-t border-zinc-200 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">Często zadawane pytania</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-zinc-200 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <span className="font-semibold text-zinc-900 text-sm sm:text-base pr-4">{faq.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-zinc-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} 
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-zinc-500 leading-relaxed border-t border-zinc-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-14 text-center overflow-hidden shadow-2xl shadow-blue-200"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Gotowy na lepszą pracę?
              </h2>
              <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Zacznij analizować CV za darmo. Bez konta, bez opłat.
              </p>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-full font-bold text-base sm:text-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 group"
              >
                Analizuj CV teraz
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEO Text */}
      <section className="py-12 bg-white border-t border-zinc-100 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto prose prose-zinc prose-sm sm:prose-base">
          <h2>Dlaczego optymalizacja CV ma znaczenie?</h2>
          <p>
            Większość firm używa systemów ATS (Applicant Tracking Systems) do filtrowania CV przed dotarciem do rekrutera. 
            Jeśli Twoje CV nie jest zoptymalizowane, ryzykujesz odrzucenie niezależnie od kwalifikacji.
          </p>
          <h3>Kluczowe korzyści z użycia CvToAI</h3>
          <ul>
            <li><strong>Dopasowanie słów kluczowych:</strong> Upewnij się, że CV mówi tym samym językiem co oferta pracy.</li>
            <li><strong>Zgodność formatowania:</strong> Unikaj błędów parsowania dzięki układom przyjaznym ATS.</li>
            <li><strong>Oszczędność czasu:</strong> Generuj spersonalizowane listy motywacyjne w sekundy.</li>
            <li><strong>Obiektywny feedback:</strong> Otrzymaj bezstronny wynik trafności i wpływu Twojego CV.</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 sm:col-span-2">
            <div className="flex items-center gap-2 text-white mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles size={14} />
              </div>
              <span className="font-bold text-lg">CvToAI</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed">
              Pomagamy kandydatom zdobywać wymarzone prace dzięki narzędziom AI.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Produkt</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Analiza CV</button></li>
              <li><button onClick={onGetStarted} className="hover:text-white transition-colors">List motywacyjny</button></li>
              <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Przygotowanie</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Prawne</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={onPrivacy} className="hover:text-white transition-colors">Polityka prywatności</button></li>
              <li><button onClick={onTerms} className="hover:text-white transition-colors">Warunki usługi</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-zinc-800 text-xs text-center">
          &copy; {new Date().getFullYear()} CvToAI. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
};
