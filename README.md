# Kıvılcım

Şarkı yazma blokajını kıran, oyun hissi veren Türkçe bir web uygulaması.
Müzisyen bir süre (15–60 dk) seçer, beş yaratıcı zarı tek tek atar
(**Tarz, Duygu, Kural, Perspektif, Kelime**), sonuçlar ekranda birikir ve
"Şarkıya Başla" ile geri sayım başlar.

## Özellikler

- **Kartın kendisi zardır** — üstüne dokun ve at; savrulma, zar yüzünün dönüşü,
  çarpma anındaki squash-and-stretch ve yayılan halka ile fiziksel bir atış hissi
  (destekleyen cihazlarda dokunsal titreşim)
- **Hepsini At** — tüm zarları kademeli tetikler
- Kelime zarı tek karışık havuzdan üç kelime verir (somut + duygusal + fiil + şiirsel)
- Beş zar da atılınca aktifleşen çalışma sayacı (başlat/duraklat/sıfırla)
- **Küçült** — sayaç, sekmeden çıkınca ekranda kalan bir Picture-in-Picture
  penceresine taşınır (Chrome/Edge; desteklenmeyen tarayıcıda buton gizlenir)
- Sayaç turu sırasında zarlara dönüp tekrar sayaca geçilebilir (sayaç arka planda sürer)
- Krem/açık varsayılan tema; sistem koyu moddaysa otomatik koyu; sağ üstteki
  düğmeyle elle değiştirilir ve tercih saklanır
- Tüm arayüz metni küçük harf; `prefers-reduced-motion` desteği; mobil uyumlu

## Geliştirme

```bash
npm install
npm run dev
```

## Derleme

```bash
npm run build
npm run preview
```

## Vercel'e deploy

Depoyu Vercel'e bağla — framework otomatik **Vite** algılanır
(Build: `npm run build`, Output: `dist`). Ya da:

```bash
npx vercel
```

## Yığın

Vite + React + TypeScript. Ek UI/animasyon kütüphanesi yok; tüm animasyonlar saf CSS.

İçerik havuzları: [`src/data/dice.ts`](src/data/dice.ts).
