# PolePosition
A new Hadoop installer and ecosystem

![resim](https://user-images.githubusercontent.com/870265/204732093-1ea33682-9eaa-451c-befd-f7cb7015ecf3.png)

An exabyte-scale, edge-to-cloud data platform for the diverse data needs of Industrial-IoT enterprise applications.

Businesses are actively developing strategies to leverage data, analytics, and artificial intelligence ( AI) capabilities.

At the same time, there is a significant change in infrastructure strategies, with the introduction of hybrid cloud and Kubernetes containerization at unimaginable rates.

This path is a multi-step process along the way with several different critical choices. The BEARTELL Pole Position Data Platform ingests, stores and manages data on a large scale to make new computational techniques and resources readily accessible. The BEARTELL Pole Position Data Platform integrates with the Kubernetes Platform and allows Kubernetes to deploy data-driven applications at scale.

1. Supports a variety of data from large to small, organized and unstructured, in tables, streams, or directories, Internet of Things ( IoT), and sensor data, including a variety of ingestion mechanisms, virtually every type of data from any data source.

2. Supports various tools and systems for computing, such as Hadoop , Spark, ML, TensorFlow, PyTorch, H2o.ai, Sklearn and Caffe.

3. Runs AI and analytics applications concurrently, without having different clusters or silos, meaning quicker time-to-market, fewer maintenance engineering, and more reliable performance, because data scientists and analysts use the same data collection.

4. Offers a wide variety of open-ended APIs POSIX, HDFS, S3, JSON, HBase, Kafka, REST.

5. For all data-in-motion from any data source, like IoT sensors, it provides pub-sub streaming and edge first.

6. Provides reliability , safety and scale to function in global, mission-critical AI and analytic applications for development.

7. Easens data and device movement with Kubernetes between on-premises and in-cloud stateful application support.

8. A vital must-have operates on any cloud, so that a customer can enjoy cloud economy and no cloud lock-in across many public clouds.

Enables a global data fabric to consume, store, handle, process, apply and analyze data at once.


## Developer Orientation (Turkish)

**Genel Bakış**

Proje, Hadoop tabanlı “PolePosition” veri platformunun uzaktan kurulumu için hazırlanmış bir Electron uygulamasıdır. README dosyasında sistem; endüstriyel IoT için geniş ölçekte veri toplama, saklama ve yönetme yetenekleri sağlayan, bulut ve Kubernetes entegrasyonu sunan bir platform olarak tanımlanır.  

**Temel Yapı**

- **Electron Uygulaması**  
  - `main.js` Electron penceresini oluşturur ve kullanıcı etkileşimine yönelik IPC kanallarını tanımlar.  
  - Uygulama `index.html` üzerinden açılır ve `renderer.js` içindeki `PageViewer` sınıfı sayfalar arası geçişi yönetir.

- **Sayfa Yönetimi**  
  - `PageViewer.js`, bir sayfa dizisi ve her sayfaya ait “filter” betiklerini okuyarak ileri/geri dolaşımı sağlar. Butonların durumu ve içerik alanı bu sınıf tarafından kontrol edilir.
  - Sayfa sırası `pole_config.json` dosyasında tanımlıdır; burada her sayfa için ilgili HTML ve JS dosyası belirtilir.

- **Sayfalar ve Filtre Betikleri**  
  - `Pages/` klasörü, kurulum sihirbazındaki adımları içerir. Her klasör içinde bir HTML dosyası ve PreLoad/OnLoad fonksiyonlarını içeren bir JS betiği bulunur (ör. `namefilter.js`).
  - Bu betikler, kullanıcı girdilerini toplar, doğrular ve gerekli durum bilgisini `PageViewer` üzerinden sonraki sayfalara aktarır.

- **Kurulum Mantığı**  
  - Asıl kurulum işlemleri `installation_part/installfilter.js` altında gerçekleşir. Seçilen bileşenlere göre uzaktaki makinelerde çalıştırılacak komut listesi hazırlanır ve `node-ssh` modülü ile sırayla yürütülür.
  - Kurulum sırasında oluşturulan YAML dosyaları ve servis tanımları Prometheus, Grafana vb. araçların ayarlanmasını da içerir.

- **Diğer Yapılar**  
  - `components.json` dosyası, seçilebilir Hadoop bileşenlerini ve bunların servis-port bilgilerini barındırır.
  - `prometheus_template.yml` ve `prometheus.yml` dosyaları izleme servislerinin temel konfigürasyon şablonlarıdır.

**Önemli Noktalar**

1. **Sayfa ve Betik İlişkisi**  
   PreLoad fonksiyonu 0 döndürdüğünde sonraki sayfaya geçilir; 1 dönerse geçiş engellenir. Bu mekanizma, her adımda kullanıcı girişlerinin doğrulanmasında kullanılır.

2. **contentState Kullanımı**  
   `PageViewer.pageContentState`, sayfalar arasında paylaşılan bilgilerin tutulduğu yapıdır. Örneğin SSH bağlantı bilgileri, seçilen bileşenler veya depolama dizinleri burada saklanır.

3. **Uzaktan Komut Çalıştırma**  
   Node-SSH ile açılan oturumlar `RemoteControlObject` içinde tutulur. Kurulum ve servis kontrol adımlarında bu oturumlar kullanılarak komutlar yürütülür.

4. **Kurulum Akışı**  
   `pole_config.json` içindeki sıraya göre önce sunucu adresleri seçilir, ardından erişim yöntemi (kullanıcı-şifre veya anahtar dosyası) belirlenir. Master node seçimi, bileşen listesi, repo ve depolama dizinleri adımları sonrası uzaktan kurulum başlatılır. Kurulum sonunda servislerin çalışıp çalışmadığı `lifecheck.js` betiği ile kontrol edilir.

**Sonraki Aşamada Öğrenilmesi Gerekenler**

- **Electron Forge Paketleme**  
  `package.json` içinde tanımlı `electron-forge` yapıları sayesinde uygulama Debian/RPM paketlerine dönüştürülebilir. Bu süreçte nasıl paket oluşturulacağını ve dağıtımın nasıl yapılacağını öğrenmek faydalı olacaktır.

- **SSH Bağlantı Yönetimi ve Hata Durumları**  
  Özellikle `namefilter.js` ve `masterfilter.js` dosyalarında yapılan bağlantı kontrollerinin nasıl çalıştığı, başarısız bağlantılarda ne yapılacağı gibi ayrıntılara hakim olmak önemli.

- **Yeni Bileşen Eklemek**  
  `components.json` yapısını inceleyerek sisteme yeni Hadoop bileşenleri veya servisler nasıl eklenir öğrenilebilir.

- **Prometheus/Grafana Ayarları**  
  `prometheus_template.yml` dosyasının dinamik olarak nasıl doldurulduğu ve kurulum aşamasında nasıl kullanıldığı incelenmeli. Bu sayede izleme sistemlerinde özelleştirme yapılabilir.

Bu bilgilerle projede ilk bakışta dikkat edilmesi gereken kısımları ve gelecek adımlarda öğrenilebilecek konuları özetlemiş olduk.

