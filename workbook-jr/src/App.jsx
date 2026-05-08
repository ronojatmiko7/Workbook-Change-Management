import React, { useState, useEffect, useRef } from 'react';
import { 
  User, BookOpen, Lightbulb, Compass, 
  Users, Flag, FileDown, Loader2, Save 
} from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState('Auto-save aktif');
  const [isGenerating, setIsGenerating] = useState(false);
  const saveTimer = useRef(null);
  const printAreaRef = useRef(null);

  // Load html2pdf dynamically
  useEffect(() => {
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Load saved data from localStorage
    const savedData = localStorage.getItem('jr_workbook_react');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved data");
      }
    }
  }, []);

  // Handle Input Changes & Auto-save


const handleChange = (e) => {
  const { id, value } = e.target;
  const newData = { ...formData, [id]: value };
  setFormData(newData);
  setSaveStatus('Mengetik...');
  if (saveTimer.current) clearTimeout(saveTimer.current);
  saveTimer.current = setTimeout(() => {
    localStorage.setItem('jr_workbook_react', JSON.stringify(newData));
    setSaveStatus('Menyimpan...');
    setTimeout(() => setSaveStatus('Tersimpan di browser'), 500);
    setTimeout(() => setSaveStatus('Auto-save aktif'), 2000);
  }, 1000);
};

  // Generate PDF
  const generatePDF = async () => {
    if (!window.html2pdf) {
      alert("Library PDF sedang dimuat, silakan coba beberapa detik lagi.");
      return;
    }

    setIsGenerating(true);
    const element = printAreaRef.current;
    
    // Temporarily adjust textareas to show all text without scrollbars for printing
    const textareas = element.querySelectorAll('textarea');
    textareas.forEach(ta => {
      ta.style.height = 'auto';
      ta.style.height = (ta.scrollHeight + 5) + 'px';
    });

    const userName = formData.nama || 'Peserta';
    const opt = {
      margin: 10,
      filename: `Workbook_Manajemen_Perubahan_${userName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await window.html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Gagal membuat PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper Components
  const NavItem = ({ href, icon: Icon, text }) => (
    <li>
      <a href={href} className="flex items-center px-6 py-3 hover:bg-slate-800 transition text-sm text-gray-200">
        <Icon size={16} className="mr-3 text-[#F0C060]" />
        {text}
      </a>
    </li>
  );

  const InputField = ({ id, label, type = "text", placeholder, className = "" }) => (
    <div className={`mb-4 ${className}`}>
      {label && <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>}
      {type === "textarea" ? (
        <textarea
          id={id}
          value={formData[id] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:outline-none focus:border-[#2471A3] focus:ring-2 focus:ring-[#2471A3]/20 transition"
        />
      ) : type === "select" ? (
        <select
          id={id}
          value={formData[id] || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:outline-none focus:border-[#2471A3] focus:ring-2 focus:ring-[#2471A3]/20 transition"
        >
          <option value="">-- Pilih --</option>
          <option value="Denial">Denial (Penyangkalan)</option>
          <option value="Anger">Anger (Frustrasi / Marah)</option>
          <option value="Bargaining">Bargaining (Tawar-menawar)</option>
          <option value="Depression">Depression (Kewalahan / Putus asa)</option>
          <option value="Exploration">Exploration (Mulai mencari jalan)</option>
          <option value="Acceptance">Acceptance (Menerima)</option>
          <option value="Integration">Integration (Beradaptasi penuh)</option>
        </select>
      ) : (
        <input
          type={type}
          id={id}
          value={formData[id] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#2471A3] focus:ring-2 focus:ring-[#2471A3]/20 transition"
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans">
      {/* Sidebar - Hidden on print */}
      <nav className="w-full md:w-64 bg-[#0D2137] text-white flex flex-col h-full shadow-xl z-10 flex-shrink-0 print:hidden">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-[#F0C060] leading-tight">Manajemen Perubahan</h1>
          <p className="text-xs text-slate-400 mt-2">PT Jasa Raharja (Persero)</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <NavItem href="#profil" icon={User} text="Profil Peserta" />
            <NavItem href="#sesi1" icon={BookOpen} text="Sesi 1: Kita & Perubahan" />
            <NavItem href="#sesi2" icon={Lightbulb} text="Sesi 2: Psikologi Perubahan" />
            <NavItem href="#sesi3" icon={Compass} text="Sesi 3: Strategi Adaptasi" />
            <NavItem href="#sesi4" icon={Users} text="Sesi 4: Resiliensi Tim" />
            <NavItem href="#sesi5" icon={Flag} text="Sesi 5: Rencana Aksi" />
          </ul>
        </div>

        <div className="p-6 border-t border-slate-700">
          <button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-full bg-[#F0C060] hover:bg-yellow-500 text-[#0D2137] disabled:opacity-70 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition shadow-lg"
          >
            {isGenerating ? <Loader2 className="animate-spin mr-2" size={20} /> : <FileDown className="mr-2" size={20} />}
            {isGenerating ? 'Memproses...' : 'Download PDF'}
          </button>
          <div className="flex items-center justify-center text-xs text-slate-400 mt-3">
            <Save size={12} className="mr-1" />
            <span>{saveStatus}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth w-full">
        <div className="max-w-4xl mx-auto py-10 px-6 sm:px-12">
          
          {/* Printable Container */}
          <div ref={printAreaRef} className="bg-white rounded-xl shadow-sm p-8 sm:p-12 border border-gray-100 print:shadow-none print:border-none print:p-0">
            
            {/* Header */}
            <div className="text-center border-b-4 border-[#0D2137] pb-8 mb-10">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0D2137] mb-2">WORKBOOK PESERTA</h2>
              <h3 className="text-xl sm:text-2xl text-[#F0C060] font-bold mb-4">Pelatihan Manajemen Perubahan & Adaptasi</h3>
              <p className="text-gray-500">PT Jasa Raharja (Persero)</p>
            </div>

            {/* Section: Profil */}
            <section id="profil" className="mb-12">
              <h4 className="text-lg font-bold text-[#0D2137] mb-4 flex items-center border-l-4 border-[#F0C060] pl-3">Informasi Peserta</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-lg border border-slate-100">
                <InputField id="nama" label="Nama Lengkap" placeholder="Masukkan nama Anda..." />
                <InputField id="unit" label="Unit Kerja / Cabang" placeholder="Masukkan unit kerja..." />
                <InputField id="tanggal" label="Tanggal Pelatihan" type="date" className="md:col-span-2 md:w-1/2" />
              </div>
            </section>

            {/* Section: Sesi 1 */}
            <section id="sesi1" className="mb-12 print:break-before-page">
              <div className="bg-[#0D2137] text-white px-6 py-3 rounded-t-lg">
                <h2 className="text-xl font-bold">SESI 1: Kita dan Perubahan</h2>
                <p className="text-sm text-[#F0C060] italic">Membuka Percakapan & Kontrak Belajar</p>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-6 sm:p-8">
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-[#2471A3] text-sm">
                  <p className="font-semibold text-[#0D2137] mb-1 flex items-center"><BookOpen size={16} className="mr-2" /> Manual Singkat:</p>
                  <p className="text-gray-700">Perubahan tidak bisa dihindari. Membicarakan dampak perubahan secara terbuka adalah langkah pertama menuju adaptasi.</p>
                </div>
                
                <h3 className="font-bold text-gray-800 mb-2">Aktivitas 1: Refleksi 2 Tahun Terakhir (Icebreaker)</h3>
                <p className="text-sm text-gray-600 mb-4">Pikirkan satu perubahan paling signifikan yang Anda alami di lingkungan pekerjaan Jasa Raharja dalam kurun waktu 2 tahun terakhir.</p>
                
                <InputField 
                  id="s1_q1" 
                  type="textarea" 
                  label="1. Ceritakan secara singkat perubahan apa yang terjadi:" 
                  placeholder="(Contoh: Perpindahan divisi, perubahan sistem manual ke digital, dll)" 
                />
                <InputField 
                  id="s1_q2" 
                  type="textarea" 
                  label="2. Bagaimana perasaan Anda saat itu, dan apa yang paling membantu Anda melewatinya?" 
                  placeholder="Tuliskan refleksi perasaan Anda..." 
                />
              </div>
            </section>

            {/* Section: Sesi 2 */}
            <section id="sesi2" className="mb-12 print:break-before-page">
              <div className="bg-[#0E7C6B] text-white px-6 py-3 rounded-t-lg">
                <h2 className="text-xl font-bold">SESI 2: Mengapa Kita Bertahan?</h2>
                <p className="text-sm text-green-100 italic">Psikologi di Balik Resistensi Perubahan</p>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-6 sm:p-8">
                <div className="mb-6 bg-teal-50 p-4 rounded-lg border-l-4 border-[#0E7C6B] text-sm">
                  <p className="font-semibold text-[#0E7C6B] mb-1 flex items-center"><Lightbulb size={16} className="mr-2" /> Manual Singkat:</p>
                  <p className="text-gray-700">Resistensi bukan kelemahan, melainkan respons biologis otak terhadap ketidakpastian. Kurva Emosi memiliki 7 fase: Denial → Anger → Bargaining → Depression → Exploration → Acceptance → Integration.</p>
                </div>

                <h3 className="font-bold text-gray-800 mb-4">Aktivitas 2: Di Mana Posisi Anda?</h3>
                <InputField 
                  id="s2_q1" 
                  type="select" 
                  label="1. Di tahap mana Anda merasa berada dalam Kurva Emosi Perubahan hari ini?" 
                />
                <InputField 
                  id="s2_q2" 
                  type="textarea" 
                  label="2. Apa satu hal yang paling membuat Anda sulit menerima perubahan tersebut?" 
                  placeholder="Tuliskan tantangan psikologis Anda..." 
                />
              </div>
            </section>

            {/* Section: Sesi 3 */}
            <section id="sesi3" className="mb-12 print:break-before-page">
              <div className="bg-[#C0392B] text-white px-6 py-3 rounded-t-lg">
                <h2 className="text-xl font-bold">SESI 3: Strategi Adaptasi</h2>
                <p className="text-sm text-red-100 italic">Dari Bertahan Menjadi Bergerak Maju</p>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-6 sm:p-8">
                <div className="mb-6 bg-red-50 p-4 rounded-lg border-l-4 border-[#C0392B] text-sm">
                  <p className="font-semibold text-[#C0392B] mb-1 flex items-center"><Compass size={16} className="mr-2" /> Manual Singkat:</p>
                  <p className="text-gray-700">Berhentilah membuang energi pada hal di luar kendali (Lingkaran Kekhawatiran). Arahkan fokus pada sikap dan tindakan Anda sendiri (Lingkaran Kendali). Jadilah <strong>Flow</strong>, hindari <strong>Fight/Freeze</strong>.</p>
                </div>

                <h3 className="font-bold text-gray-800 mb-4">Aktivitas 3: Pemetaan Lingkaran Kendali</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <InputField id="s3_kepedulian" type="textarea" label="Lingkaran Kekhawatiran" placeholder="Di luar kendali (Misal: Sistem error)" />
                  <InputField id="s3_pengaruh" type="textarea" label="Lingkaran Pengaruh" placeholder="Bisa dipengaruhi (Misal: Beri saran)" />
                  <InputField id="s3_kendali" type="textarea" label="Lingkaran Kendali" placeholder="Aksi nyata HARI INI (Misal: Belajar)" />
                </div>
              </div>
            </section>

            {/* Section: Sesi 4 */}
            <section id="sesi4" className="mb-12 print:break-before-page">
              <div className="bg-[#F0C060] text-[#0D2137] px-6 py-3 rounded-t-lg">
                <h2 className="text-xl font-bold">SESI 4: Resiliensi Tim</h2>
                <p className="text-sm text-yellow-800 italic">Membangun Kekuatan Bersama Menghadapi Krisis</p>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-6 sm:p-8">
                 <div className="mb-6 bg-yellow-50 p-4 rounded-lg border-l-4 border-[#F0C060] text-sm">
                  <p className="font-semibold text-yellow-700 mb-1 flex items-center"><Users size={16} className="mr-2" /> Manual Singkat:</p>
                  <p className="text-gray-700">Tim yang kuat membutuhkan Keamanan Psikologis, Tujuan Bersama, dan Kapasitas Adaptif. Empati harus mendahului pemberian solusi.</p>
                </div>
                <h3 className="font-bold text-gray-800 mb-4">Aktivitas 4: Jurnal Refleksi Tim</h3>
                <InputField id="s4_q1" label="1. Siapa di tim kerja nyata saya yang terlihat paling kesulitan saat ini? (Bisa inisial)" placeholder="Nama / Inisial..." className="md:w-1/2" />
                <InputField id="s4_q2" type="textarea" label="2. Apa SATU tindakan nyata yang bisa saya lakukan untuk membantunya minggu depan?" placeholder="Rencana tindakan dukungan..." />
              </div>
            </section>

            {/* Section: Sesi 5 */}
            <section id="sesi5" className="mb-6 print:break-before-page">
              <div className="bg-slate-800 text-white px-6 py-3 rounded-t-lg">
                <h2 className="text-xl font-bold">SESI 5: Komitmen & Rencana Aksi</h2>
                <p className="text-sm text-gray-300 italic">Mengubah Wawasan Menjadi Tindakan Nyata</p>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-6 sm:p-8">
                <InputField id="buddy" label="Accountability Buddy Saya:" placeholder="Nama rekan kerja..." className="md:w-1/2 mb-8" />

                <h3 className="font-bold text-gray-800 mb-6 border-b pb-2">KARTU KOMITMEN AKSI (ACTION PLAN)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                    <h4 className="text-xl font-bold text-red-600 mb-1">STOP</h4>
                    <p className="text-sm font-medium text-gray-700 mb-4">Berhenti Lakukan</p>
                    <InputField id="s5_stop" type="textarea" placeholder="Satu kebiasaan lama (di luar kendali) yang akan saya hentikan..." />
                  </div>
                  <div className="bg-teal-50 p-6 rounded-xl border border-teal-100">
                    <h4 className="text-xl font-bold text-teal-700 mb-1">START</h4>
                    <p className="text-sm font-medium text-gray-700 mb-4">Mulai Lakukan</p>
                    <InputField id="s5_start" type="textarea" placeholder="Tindakan proaktif baru (dalam kendali) minggu depan..." />
                  </div>
                </div>
              </div>
            </section>

            {/* Quote Footer */}
            <div className="text-center mt-12 mb-4 text-gray-400 italic text-sm">
              "Bahaya terbesar di masa penuh gejolak bukanlah gejolak itu sendiri; melainkan bertindak menggunakan logika hari kemarin."<br/>
              <strong className="text-gray-500">— Peter Drucker</strong>
            </div>

          </div>
          
          {/* Mobile Download Button */}
          <div className="md:hidden mt-8 text-center print:hidden">
            <button 
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full bg-[#F0C060] text-[#0D2137] font-bold py-4 rounded-xl shadow-lg flex items-center justify-center disabled:opacity-70"
            >
              {isGenerating ? <Loader2 className="animate-spin mr-2" size={20} /> : <FileDown className="mr-2" size={20} />}
              {isGenerating ? 'Memproses PDF...' : 'Download Workbook PDF'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}