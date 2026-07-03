# MasrafApp

Bir Expo + React Native (TypeScript) projesi. Hızlı başlangıç için oluşturulmuş, dosya tabanlı yönlendirme kullanan ve Android yapı yapılandırması içeren mobil uygulama şablonu.

**Öne Çıkanlar**
- **Teknoloji**: Expo, React Native, TypeScript
- **Yönlendirme**: Dosya tabanlı yönlendirme (app/ dizini)
- **Platformlar**: Android (yerel yapı dosyaları), iOS (Expo üzerinden)

**Hızlı Başlangıç**
- **Bağımlılıkları yükle**:

```bash
npm install
```
- **Geliştirme sunucusunu başlat**:

```bash
npx expo start
```

Çıktıda Android emülatörü, iOS simülatörü, Expo Go veya development build seçeneklerini göreceksiniz.

**Android için (yerel yapı)**
- Projede Android klasörü ve Gradle yapılandırması mevcuttur. Yerel bir APK veya geliştirme yapısı oluşturmak için Android Studio veya Gradle kullanın.

**Projeyi sıfırlama**
- Starter içeriğini taşımak ve boş bir `app` dizini oluşturmak için:

```bash
npm run reset-project
```

**Proje Yapısı (kısaca)**
- **app/**: Uygulama kaynakları ve dosya tabanlı yönlendirme
- **android/**: Android proje yapılandırması (native kodlar ve Gradle)
- **assets/**: Görseller ve statik kaynaklar
- **constants/**, **hooks/**, **types/**: Uygulama mantığı için yardımcı klasörler
- **firebase.ts**: Projede Firebase kullanımı için başlangıç noktası (varsa)

**Önemli Dosyalar**
- [README.md](README.md): Bu dosya
- [app/_layout.tsx](app/_layout.tsx): Uygulama düzeni ve router başlangıcı

**Çalışma İpuçları**
- Metro/Expo önbellek sorunlarında temiz başlatmak için:

```bash
npx expo start -c
```
- Android cihaz veya emülatöre yüklemek için bağlı cihazı kullanın veya Android Studio'da emülatör başlatın.

**Katkıda Bulunma**
- Hatalar veya geliştirme önerileri için pull request açabilirsiniz. Küçük bir katkı rehberi yoksa önce issue açın.

**Lisans**
- Proje kökünde bir `LICENSE` dosyası yoksa, kullanmak istediğiniz lisansı ekleyin.

Sorularınız veya README'de değişiklik isteğiniz olursa bildirin — güncelleyeyim.
