// Kargo fiyatları (TL cinsinden)
const kargoFiyatlari = {
    tyexpress: {
        dusuk: 23.496,    // 0-124.99 TL arası
        orta: 44.988,     // 125-199.99 TL arası
        yuksek: 53.34   // 200 TL ve üzeri
    },
    ptt: {
        dusuk: 23.496,
        orta: 44.988,
        yuksek: 57.264
    },
    aras: {
        dusuk: 30.996,
        orta: 53.988,
        yuksek: 56.988
    },
    surat: {
        dusuk: 30.996,
        orta: 53.988,
        yuksek: 58.464
    },
    mng: {
        dusuk: 30.996,
        orta: 53.988,
        yuksek: 62.388
    },
    yurtici: {
        dusuk: 51.996,
        orta: 71.496,
        yuksek: 75.972
    }
};

const HIZMET_BEDELI = 8.39;
const HIZMET_KDV_ORANI = 0.20; // Hizmet bedeli KDV oranı %20
const KARGO_KDV_ORANI = 0.20;  // Kargo KDV oranı %20
const KOMISYON_KDV_ORANI = 0.20; // Komisyon KDV oranı %20

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('dark-theme', isDark);
}

// Sayfa yüklendiğinde tema tercihini kontrol et
document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage'da tema tercihi yoksa veya dark ise dark theme uygula
    const savedTheme = localStorage.getItem('dark-theme');
    if (savedTheme === null || savedTheme === 'true') {
        document.body.classList.add('dark-theme');
        localStorage.setItem('dark-theme', 'true');
    }
});

function getKargoUcreti(satisFiyati, kargoFirmasi) {
    if (satisFiyati < 125) {
        return kargoFiyatlari[kargoFirmasi].dusuk;
    } else if (satisFiyati < 200) {
        return kargoFiyatlari[kargoFirmasi].orta;
    } else {
        return kargoFiyatlari[kargoFirmasi].yuksek;
    }
}

function hesaplaKDV(tutar, oran) {
    return tutar * (oran / 100);
}

function kdvlidenKdvsiz(kdvliFiyat, kdvOrani) {
    return kdvliFiyat / (1 + (kdvOrani / 100));
}

function karHesapla() {
    const maliyetKdvDahil = parseFloat(document.getElementById('maliyet').value);
    const satisFiyatiKdvDahil = parseFloat(document.getElementById('satisFiyati').value);
    const komisyonOrani = parseFloat(document.getElementById('komisyonOrani').value);
    const secilenKargo = document.getElementById('kargoFirmasi').value;
    const kdvOrani = parseFloat(document.getElementById('kdvOrani').value);

    if (isNaN(maliyetKdvDahil) || isNaN(satisFiyatiKdvDahil) || isNaN(komisyonOrani)) {
        alert('Lütfen geçerli değerler giriniz!');
        return;
    }

    // KDV'siz tutarları hesapla
    const maliyetKdvsiz = kdvlidenKdvsiz(maliyetKdvDahil, kdvOrani);
    const satisFiyatiKdvsiz = kdvlidenKdvsiz(satisFiyatiKdvDahil, kdvOrani);
    const kargoUcretiKdvDahil = getKargoUcreti(satisFiyatiKdvDahil, secilenKargo);
    const kargoUcretiKdvsiz = kdvlidenKdvsiz(kargoUcretiKdvDahil, KARGO_KDV_ORANI * 100);
    
    // Komisyon KDV'li satış fiyatı üzerinden hesaplanır
    const komisyonTutariKdvDahil = (satisFiyatiKdvDahil * komisyonOrani) / 100;
    const komisyonTutariKdvsiz = kdvlidenKdvsiz(komisyonTutariKdvDahil, KOMISYON_KDV_ORANI * 100);
    
    // Hizmet bedeli KDV'siz tutarı
    const hizmetBedeliKdvsiz = kdvlidenKdvsiz(HIZMET_BEDELI, HIZMET_KDV_ORANI * 100);

    // KDV hesaplamaları
    const satistanOlusanKDV = satisFiyatiKdvDahil - satisFiyatiKdvsiz;
    const alistanOlusanKDV = maliyetKdvDahil - maliyetKdvsiz;
    const kargodanOlusanKDV = kargoUcretiKdvDahil - kargoUcretiKdvsiz;
    const komisyondanOlusanKDV = komisyonTutariKdvDahil - komisyonTutariKdvsiz;
    const hizmetBedelindenOlusanKDV = HIZMET_BEDELI - hizmetBedeliKdvsiz;

    // Toplam ödenecek KDV (Satıştan oluşan KDV - Diğer tüm KDV'ler)
    const digerKDVlerToplami = alistanOlusanKDV + kargodanOlusanKDV + komisyondanOlusanKDV + hizmetBedelindenOlusanKDV;
    const odenecekKDV = satistanOlusanKDV - digerKDVlerToplami;

    // KDV'siz tutarlar üzerinden kar hesaplaması
    const karKdvsiz = satisFiyatiKdvsiz - maliyetKdvsiz - kargoUcretiKdvsiz - hizmetBedeliKdvsiz - komisyonTutariKdvsiz;
    
    // Net kar (KDV'siz kardan ödenecek KDV'yi çıkar)
    const netKar = karKdvsiz - odenecekKDV;
    const karOrani = ((netKar / maliyetKdvsiz) * 100).toFixed(2);
    const yatirimGeriDonusOrani = ((netKar / maliyetKdvsiz) * 100).toFixed(2);

    // Sonuçları göster
    document.getElementById('results').innerHTML = `
        <div class="net-kar">
            <div class="kar-label">Net Kar</div>
            <div class="kar-value">${netKar.toFixed(2)}₺</div>
            <div class="kar-oran">Kar Oranı: %${karOrani}</div>
        </div>

        <div class="result-group">
            <h3>Temel Bilgiler (KDV Hariç)</h3>
            <div class="result-item">
                <span>Satış Fiyatı:</span>
                <span>${satisFiyatiKdvsiz.toFixed(2)}₺</span>
            </div>
            <div class="result-item">
                <span>Alış Fiyatı:</span>
                <span>-${maliyetKdvsiz.toFixed(2)}₺</span>
            </div>
            <div class="result-item">
                <span>Komisyon:</span>
                <span>-${komisyonTutariKdvsiz.toFixed(2)}₺</span>
            </div>
            <div class="result-item">
                <span>Kargo Ücreti:</span>
                <span>-${kargoUcretiKdvsiz.toFixed(2)}₺</span>
            </div>
            <div class="result-item">
                <span>Hizmet Bedeli:</span>
                <span>-${hizmetBedeliKdvsiz.toFixed(2)}₺</span>
            </div>
            <div class="result-item total-kdv">
                <span>KDV'siz Kar:</span>
                <span>${karKdvsiz.toFixed(2)}₺</span>
            </div>
            <div class="result-item">
                <span>Ödenecek KDV:</span>
                <span>-${odenecekKDV.toFixed(2)}₺</span>
            </div>
            <div class="result-item total-kdv">
                <span>Net Kar:</span>
                <span>${netKar.toFixed(2)}₺</span>
            </div>
            <div class="result-item">
                <span>Kar Oranı:</span>
                <span>%${karOrani}</span>
            </div>
            <div class="result-item">
                <span>Yatırım Geri Dönüş Oranı:</span>
                <span>%${yatirimGeriDonusOrani}</span>
            </div>
        </div>

        <div class="result-group">
            <h3>KDV Detayları</h3>
            <div class="result-item">
                <span>Satıştan Oluşan KDV (%${kdvOrani}):</span>
                <span>${satistanOlusanKDV.toFixed(2)}₺</span>
            </div>
            <div class="result-item">
                <span>Alıştan Oluşan KDV (%${kdvOrani}):</span>
                <span>-${alistanOlusanKDV.toFixed(2)}₺</span>
            </div>
            <div class="result-item">
                <span>Kargodan Oluşan KDV (%${KARGO_KDV_ORANI * 100}):</span>
                <span>-${kargodanOlusanKDV.toFixed(2)}₺</span>
            </div>
            <div class="result-item">
                <span>Komisyondan Oluşan KDV (%${KOMISYON_KDV_ORANI * 100}):</span>
                <span>-${komisyondanOlusanKDV.toFixed(2)}₺</span>
            </div>
            <div class="result-item">
                <span>Hizmet Bedelinden Oluşan KDV (%${HIZMET_KDV_ORANI * 100}):</span>
                <span>-${hizmetBedelindenOlusanKDV.toFixed(2)}₺</span>
            </div>
            <div class="result-item total-kdv">
                <span>Ödenecek KDV:</span>
                <span>${odenecekKDV.toFixed(2)}₺</span>
            </div>
        </div>

        <div class="result-group">
            <h3>Kargo Bilgisi</h3>
            <div class="result-item">
                <span>Kargo Ücreti (KDV Dahil):</span>
                <span>${kargoUcretiKdvDahil.toFixed(2)}₺ (${getSatisFiyatiAraligi(satisFiyatiKdvDahil)})</span>
            </div>
        </div>
    `;
}

function getSatisFiyatiAraligi(satisFiyati) {
    if (satisFiyati < 125) {
        return '0-124.99 TL arası';
    } else if (satisFiyati < 200) {
        return '125-199.99 TL arası';
    } else {
        return '200 TL ve üzeri';
    }
} 