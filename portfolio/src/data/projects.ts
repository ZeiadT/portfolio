import type { ProjectDetails } from '@/domain/types';

/**
 * Portfolio Projects Data Hub
 * Comprehensive engineering specifications and deep-dive telemetry for flagship projects.
 */
export const PROJECTS: ProjectDetails[] = [
  {
    id: 'dusk',
    title: 'Dusk',
    subtitle: 'Weather Forecasting Application',
    category: 'Android',
    year: '2025',
    tags: ['Kotlin', 'Jetpack Compose', 'MVVM/MVI', 'Room', 'Offline-First'],
    description: 'Offline-first weather forecasting application built with Clean Architecture, featuring real-time forecasts, alerts, and location caching.',
    longDescription: 'Dusk is an offline-first weather forecasting Android application architected around Clean Architecture and unidirectional data flow (MVI/MVVM). Features Open-Meteo REST ingestion, local Room SQLite caching with automated TTL eviction, Jetpack Compose reactive canvas weather animations, and real-time severe weather alert notifications.',
    liveStatus: 'Active Beta',
    links: {
      github: 'https://github.com/ZeiadT/Dusk',
      apk: 'https://github.com/ZeiadT/Dusk/releases',
    },
    media: {
      thumbnail: '/assets/projects/dusk.png',
      images: ['/assets/projects/dusk-1.png', '/assets/projects/dusk-2.png'],
    },
    galleryScreenshots: ['/assets/projects/dusk-1.png', '/assets/projects/dusk-2.png'],
    accentColor: '#4f46e5',
    architectureGraph: {
      nodes: [
        { id: 'dusk-ui', label: 'Jetpack Compose UI', layer: 'Presentation', x: 90, y: 160, description: 'Declarative canvas animations & weather theme shaders' },
        { id: 'dusk-vm', label: 'Weather MVI ViewModel', layer: 'Domain', x: 290, y: 160, description: 'StateFlow intent processing & UI state emission' },
        { id: 'dusk-repo', label: 'Forecast Repository', layer: 'Data', x: 490, y: 160, description: 'Single source of truth coordinating cache & remote' },
        { id: 'dusk-db', label: 'Room SQLite Database', layer: 'Data', x: 690, y: 90, description: 'Local weather cache with automated TTL eviction' },
        { id: 'dusk-api', label: 'Open-Meteo REST API', layer: 'Network', x: 690, y: 230, description: 'Retrofit & OkHttp client for real-time meteo ingestion' },
      ],
      flows: [
        { from: 'dusk-ui', to: 'dusk-vm', label: 'User Intents' },
        { from: 'dusk-vm', to: 'dusk-repo', label: 'Observe Forecast' },
        { from: 'dusk-repo', to: 'dusk-db', label: 'TTL Cache Read/Write' },
        { from: 'dusk-repo', to: 'dusk-api', label: 'Fetch Weather' },
      ],
    },
    architectureHighlights: [
      'Unidirectional Data Flow with Jetpack Compose & StateFlow',
      'Offline-first caching via Room Database with TTL cache policy',
      'Clean Architecture separation: Presentation, Domain, Data layers',
    ],
    metrics: [
      { label: 'Cold Start', value: '< 280ms', detail: 'Macrobenchmark baseline profiles' },
      { label: 'Cache Hit Rate', value: '94.6%', detail: 'Local Room database persistence' },
      { label: 'Crash-Free Rate', value: '99.9%', detail: 'Production crash reporting' },
    ],
    codeSnippet: {
      filename: 'WeatherRepositoryImpl.kt',
      language: 'kotlin',
      description: 'Single-source-of-truth repository implementation with local cache emission before network fetch.',
      code: `class WeatherRepositoryImpl(
    private val localDataSource: WeatherDao,
    private val remoteDataSource: OpenMeteoApi,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) : WeatherRepository {

    override fun observeForecast(coords: Coordinates): Flow<Resource<Forecast>> = flow {
        emit(Resource.Loading)
        val cached = localDataSource.getForecast(coords.lat, coords.lon)
        if (cached != null) {
            emit(Resource.Success(cached.toDomain()))
        }
        try {
            val response = remoteDataSource.fetchWeather(coords.lat, coords.lon)
            localDataSource.insertForecast(response.toEntity())
            emit(Resource.Success(response.toDomain()))
        } catch (e: Exception) {
            if (cached == null) {
                emit(Resource.Error(e.localizedMessage ?: "Network error"))
            }
        }
    }.flowOn(ioDispatcher)
}`,
    },
  },
  {
    id: 'cargo',
    title: 'Cargo',
    subtitle: 'Cross-Platform Logistics & Fleet Tracker',
    category: 'Cross-Platform',
    year: '2025',
    tags: ['KMP', 'Compose Multiplatform', '.NET', 'Microservices', 'Azure'],
    description: 'Logistics platform connecting shippers and drivers via live GPS tracking, QR-code delivery verification, and in-app messaging.',
    longDescription: 'High-performance cross-platform fleet tracking and logistics coordination suite built with Kotlin Multiplatform (KMP), Compose Multiplatform, and .NET microservices. Enables real-time GPS telemetry ingestion, dispatch routing, dynamic QR bill-of-lading verification, and resilient offline synchronization for drivers across remote transit zones.',
    liveStatus: 'Active Beta',
    links: {
      github: 'https://github.com/Cargo-Org',
      demo: 'https://cargo-fleet.azureedge.net',
    },
    media: {
      thumbnail: '/assets/projects/cargo.png',
      images: ['/assets/projects/cargo-1.png', '/assets/projects/cargo-2.png'],
    },
    galleryScreenshots: ['/assets/projects/cargo-1.png', '/assets/projects/cargo-2.png'],
    accentColor: '#0ea5e9',
    architectureGraph: {
      nodes: [
        { id: 'cargo-ui', label: 'Compose Multiplatform UI', layer: 'Presentation', x: 90, y: 160, description: 'Shared reactive UI running on Android & iOS' },
        { id: 'cargo-kmp', label: 'Shared KMP Domain', layer: 'Domain', x: 290, y: 160, description: 'StateFlow view models, SQLDelight offline sync' },
        { id: 'cargo-gateway', label: 'ASP.NET Core Gateway', layer: 'Network', x: 490, y: 160, description: 'Reverse proxy, auth validation & SignalR hub' },
        { id: 'cargo-dispatch', label: 'Dispatch Microservice', layer: 'Domain', x: 690, y: 90, description: 'Route optimization & geospatial ETA calculation engine' },
        { id: 'cargo-store', label: 'Azure Cosmos DB & Redis', layer: 'Data', x: 690, y: 230, description: 'High-throughput sub-millisecond telemetry cache' },
      ],
      flows: [
        { from: 'cargo-ui', to: 'cargo-kmp', label: 'Kotlin Bindings' },
        { from: 'cargo-kmp', to: 'cargo-gateway', label: 'WebSocket & gRPC' },
        { from: 'cargo-gateway', to: 'cargo-dispatch', label: 'Service Bus Event' },
        { from: 'cargo-dispatch', to: 'cargo-store', label: 'Geospatial Query' },
      ],
    },
    architectureHighlights: [
      '100% Shared UI & business logic across iOS and Android via KMP',
      'Real-time bidirectional vehicle coordinates via WebSocket/SignalR',
      'Microservice dispatch backend with geospatial geofencing calculations',
    ],
    metrics: [
      { label: 'Code Sharing', value: '88%', detail: 'Cross-platform logic across Android & iOS' },
      { label: 'Ping Latency', value: '< 65ms', detail: 'Real-time SignalR telemetry stream' },
      { label: 'Active Drivers', value: '1.2k+', detail: 'Concurrent fleet routing sessions' },
    ],
    codeSnippet: {
      filename: 'FleetTrackingManager.kt',
      language: 'kotlin',
      description: 'Multiplatform location stream filter and high-frequency GPS telemetry emitter.',
      code: `class FleetTrackingManager(
    private val locationEngine: LocationEngine,
    private val socketClient: FleetSocketClient,
    private val scope: CoroutineScope
) {
    private val _telemetryState = MutableStateFlow<TelemetryState>(TelemetryState.Idle)
    val telemetryState: StateFlow<TelemetryState> = _telemetryState.asStateFlow()

    fun startTracking(tripId: String) {
        scope.launch {
            locationEngine.locationUpdates()
                .filter { it.accuracy <= 15.0f }
                .sample(2000)
                .collect { loc ->
                    val packet = TelemetryPacket(tripId, loc.latitude, loc.longitude, Clock.System.now())
                    socketClient.sendTelemetry(packet)
                    _telemetryState.value = TelemetryState.Broadcasting(packet)
                }
        }
    }
}`,
    },
  },
  {
    id: 'gusto',
    title: 'Gusto',
    subtitle: 'Culinary & Meal Planning Assistant',
    category: 'Android',
    year: '2024',
    tags: ['Java', 'Android', 'MVVM', 'Retrofit', 'RxJava', 'Room'],
    description: 'Meal planning application integrating TheMealDB API for recipe discovery, offline favorites access, and scheduled dietary routines.',
    longDescription: 'Culinary assistant and personalized meal planner integrating TheMealDB API. Designed with Android MVVM architecture, reactive data flows, scheduled dietary calendars, and local SQLite meal persistence for continuous kitchen guidance without network connectivity.',
    liveStatus: 'Production',
    links: {
      github: 'https://github.com/ZeiadT/Gusto',
      apk: 'https://github.com/ZeiadT/Gusto/releases',
    },
    media: {
      thumbnail: '/assets/projects/gusto.png',
      images: ['/assets/projects/gusto-1.png', '/assets/projects/gusto-2.png'],
    },
    galleryScreenshots: ['/assets/projects/gusto-1.png', '/assets/projects/gusto-2.png'],
    accentColor: '#f97316',
    architectureGraph: {
      nodes: [
        { id: 'gusto-ui', label: 'Dietary UI & Recipe Cards', layer: 'Presentation', x: 90, y: 160, description: 'Interactive meal planners and ingredient checklists' },
        { id: 'gusto-vm', label: 'Meal Planner ViewModel', layer: 'Domain', x: 290, y: 160, description: 'Reactive search debounce & dietary state pipeline' },
        { id: 'gusto-repo', label: 'Recipe Repository', layer: 'Data', x: 490, y: 160, description: 'Aggregates API queries with Room favorite bookmarks' },
        { id: 'gusto-db', label: 'Room SQLite Database', layer: 'Data', x: 690, y: 90, description: 'Offline meal plans and grocery lists' },
        { id: 'gusto-api', label: 'TheMealDB REST API', layer: 'Network', x: 690, y: 230, description: 'Retrofit client for recipe discovery and categories' },
      ],
      flows: [
        { from: 'gusto-ui', to: 'gusto-vm', label: 'Search Query & Filter' },
        { from: 'gusto-vm', to: 'gusto-repo', label: 'Combine Streams' },
        { from: 'gusto-repo', to: 'gusto-db', label: 'Persist Bookmarks' },
        { from: 'gusto-repo', to: 'gusto-api', label: 'Fetch Recipes' },
      ],
    },
    architectureHighlights: [
      'Reactive stream transformations for multi-parameter ingredient filtering',
      'Room SQLite caching for completely offline recipe access',
      'Decoupled MVVM pattern with clean repository abstraction',
    ],
    metrics: [
      { label: 'Recipe Library', value: '10k+', detail: 'Indexed culinary dishes & guides' },
      { label: 'Offline Access', value: '100%', detail: 'Cached recipes & grocery inventories' },
      { label: 'Search Latency', value: '< 45ms', detail: 'Local SQLite indexed queries' },
    ],
    codeSnippet: {
      filename: 'RecipeFilterPipeline.kt',
      language: 'kotlin',
      description: 'Debounced reactive flow combiner filtering recipes by dietary constraint and search text.',
      code: `class RecipeFilterPipeline(
    private val repository: RecipeRepository,
    private val dispatcher: CoroutineDispatcher = Dispatchers.Default
) {
    fun filterMeals(
        query: Flow<String>,
        dietary: Flow<DietaryPreference>
    ): Flow<List<Recipe>> = combine(query, dietary) { q, pref ->
        Pair(q.trim().lowercase(), pref)
    }.debounce(300)
     .distinctUntilChanged()
     .flatMapLatest { (q, pref) ->
         repository.searchRecipes(q, pref)
     }.flowOn(dispatcher)
}`,
    },
  },
  {
    id: 'sportx',
    title: 'SportX',
    subtitle: 'Live Sports & Match Tracking',
    category: 'iOS',
    year: '2024',
    tags: ['Swift', 'iOS', 'MVP', 'Core Data', 'REST API'],
    description: 'Sports tracking app displaying leagues, fixtures, and roster insights with persistent offline favorites.',
    longDescription: 'High-tempo iOS sports discovery and live match tracker providing real-time league standings, fixture timelines, player statistics, and offline team favoriting. Architected using MVP and clean Swift abstractions with Core Data local persistence and URLSession networking.',
    liveStatus: 'Production',
    links: {
      github: 'https://github.com/Sporto-org/Sportx',
    },
    media: {
      thumbnail: '/assets/projects/sportx.png',
      images: ['/assets/projects/sportx-1.png', '/assets/projects/sportx-2.png'],
    },
    galleryScreenshots: ['/assets/projects/sportx-1.png', '/assets/projects/sportx-2.png'],
    accentColor: '#10b981',
    architectureGraph: {
      nodes: [
        { id: 'sportx-vc', label: 'Match ViewController', layer: 'Presentation', x: 90, y: 160, description: 'Dynamic scoreboard views and live league ticker' },
        { id: 'sportx-presenter', label: 'Match MVP Presenter', layer: 'Domain', x: 290, y: 160, description: 'Formats live match stats & handles user bookmarks' },
        { id: 'sportx-net', label: 'URLSession Async Client', layer: 'Network', x: 490, y: 160, description: 'Structured concurrency client for sports REST APIs' },
        { id: 'sportx-coredata', label: 'Core Data Stack', layer: 'Data', x: 690, y: 90, description: 'Local persistence for favorite teams and leagues' },
        { id: 'sportx-feed', label: 'Live Sports Feed API', layer: 'Network', x: 690, y: 230, description: 'Real-time match events and standings provider' },
      ],
      flows: [
        { from: 'sportx-vc', to: 'sportx-presenter', label: 'User Actions' },
        { from: 'sportx-presenter', to: 'sportx-net', label: 'Fetch Live Data' },
        { from: 'sportx-presenter', to: 'sportx-coredata', label: 'Cache Favorites' },
        { from: 'sportx-net', to: 'sportx-feed', label: 'HTTP REST' },
      ],
    },
    architectureHighlights: [
      'Clean MVP pattern enforcing strict decoupling of UIKit views from business logic',
      'Core Data caching layer ensuring instantaneous app launches and offline fixture review',
      'Modern Swift async/await concurrency with structured cancellation',
    ],
    metrics: [
      { label: 'Live Latency', value: '< 120ms', detail: 'Real-time score update turnaround' },
      { label: 'App Launch', value: '310ms', detail: 'Warm start with Core Data prefetch' },
      { label: 'Memory Footprint', value: '38MB', detail: 'Optimized image asset caching' },
    ],
    codeSnippet: {
      filename: 'MatchPresenter.swift',
      language: 'swift',
      description: 'Swift concurrency MVP presenter orchestrating network match updates with Core Data offline favorites.',
      code: `final class MatchPresenter: MatchPresenterProtocol {
    private weak var view: MatchViewProtocol?
    private let networkService: SportsNetworkServiceProtocol
    private let dataStore: CoreDataStoreProtocol

    init(view: MatchViewProtocol, networkService: SportsNetworkServiceProtocol, dataStore: CoreDataStoreProtocol) {
        self.view = view
        self.networkService = networkService
        self.dataStore = dataStore
    }

    func loadLiveFixtures() async {
        view?.showLoadingIndicator()
        do {
            let fixtures = try await networkService.fetchLiveFixtures()
            let bookmarkedIds = try dataStore.fetchFavoriteTeamIds()
            let viewModels = fixtures.map { $0.toViewModel(isFavorite: bookmarkedIds.contains($0.homeTeamId)) }
            view?.renderFixtures(viewModels)
        } catch {
            view?.displayError(error.localizedDescription)
        }
    }
}`,
    },
  },
  {
    id: 'elevated',
    title: 'ElevatED',
    subtitle: 'AI-Powered Educational Platform',
    category: 'Full-Stack',
    year: '2025',
    tags: ['Flutter', 'Dart', 'Python', 'BLoC', 'AI Audio Analysis'],
    description: 'Automated content validation via audio analysis models and a high-throughput media pipeline using FTP and reactive state management.',
    longDescription: 'Intelligent educational platform combining cross-platform Flutter client with an AI-driven audio verification pipeline. Evaluates student pronunciation and comprehension using customized audio analysis models, high-throughput media transport, and reactive BLoC state management.',
    liveStatus: 'Active Beta',
    links: {
      github: 'https://github.com/ZeiadT/ElevateEd--Learning_APP',
      demo: 'https://elevated-learn.app',
    },
    media: {
      thumbnail: '/assets/projects/elevated.png',
      images: ['/assets/projects/elevated-1.png', '/assets/projects/elevated-2.png'],
    },
    galleryScreenshots: ['/assets/projects/elevated-1.png', '/assets/projects/elevated-2.png'],
    accentColor: '#8b5cf6',
    architectureGraph: {
      nodes: [
        { id: 'elevated-ui', label: 'Flutter BLoC UI', layer: 'Presentation', x: 90, y: 160, description: 'Interactive lesson modules and voice recording canvas' },
        { id: 'elevated-bloc', label: 'Evaluation BLoC', layer: 'Domain', x: 290, y: 160, description: 'Reactive stream processor for audio session states' },
        { id: 'elevated-pipeline', label: 'Media Transport Pipeline', layer: 'Network', x: 490, y: 160, description: 'Chunked binary audio upload over FTP/HTTP' },
        { id: 'elevated-ai', label: 'AI Speech Inference Server', layer: 'Domain', x: 690, y: 90, description: 'Python acoustic models evaluating pronunciation accuracy' },
        { id: 'elevated-db', label: 'PostgreSQL & Cloud Store', layer: 'Data', x: 690, y: 230, description: 'User mastery history and acoustic benchmark matrices' },
      ],
      flows: [
        { from: 'elevated-ui', to: 'elevated-bloc', label: 'Audio Event Stream' },
        { from: 'elevated-bloc', to: 'elevated-pipeline', label: 'Upload Sample' },
        { from: 'elevated-pipeline', to: 'elevated-ai', label: 'Process Audio File' },
        { from: 'elevated-ai', to: 'elevated-db', label: 'Store Analytics' },
      ],
    },
    architectureHighlights: [
      'Reactive BLoC state architecture ensuring predictable unidirectional UI rendering',
      'Zero-latency local audio capture and chunked asynchronous cloud transmission',
      'Real-time AI acoustic scoring with phonetic breakdown feedback',
    ],
    metrics: [
      { label: 'Audio Inference', value: '420ms', detail: 'End-to-end pronunciation evaluation' },
      { label: 'State Re-renders', value: '0 Leaks', detail: 'BLoC scoped stream subscriptions' },
      { label: 'Accuracy Score', value: '96.2%', detail: 'Phonetic acoustic model alignment' },
    ],
    codeSnippet: {
      filename: 'AudioEvaluationBloc.dart',
      language: 'dart',
      description: 'Flutter BLoC state handler managing chunked audio upload and real-time inference scoring.',
      code: `class AudioEvaluationBloc extends Bloc<EvaluationEvent, EvaluationState> {
  final AudioRepository repository;
  final AudioAnalysisService analysisService;

  AudioEvaluationBloc({required this.repository, required this.analysisService})
      : super(const EvaluationInitial()) {
    on<SubmitAudioSample>((event, emit) async {
      emit(const EvaluationInProgress());
      try {
        final uploadUri = await repository.uploadChunkedSample(event.audioPath);
        final score = await analysisService.evaluatePhonetics(uploadUri);
        emit(EvaluationCompleted(score: score));
      } catch (err) {
        emit(EvaluationFailure(message: err.toString()));
      }
    });
  }
}`,
    },
  },
  {
    id: 'wireless-mouse',
    title: 'Wireless Mouse',
    subtitle: 'Low-Latency Remote PC Controller',
    category: 'Full-Stack',
    year: '2024',
    tags: ['Flutter', 'C#', '.NET', 'WebSockets', 'Windows API'],
    description: 'Gesture-based cursor navigation with low-latency socket communication between mobile device and Windows desktop OS.',
    longDescription: 'High-responsiveness remote PC control suite turning any mobile device into a low-latency multi-touch trackpad and keyboard. Combines a Flutter mobile frontend with a native C# .NET desktop background daemon that translates touch gestures into Windows API mouse and keyboard input events over local WebSockets.',
    liveStatus: 'Open Source',
    links: {
      github: 'https://github.com/ZeiadT/WirelessMouse-Server',
    },
    media: {
      thumbnail: '/assets/projects/wireless-mouse.png',
      images: ['/assets/projects/wireless-mouse-1.png', '/assets/projects/wireless-mouse-2.png'],
    },
    galleryScreenshots: ['/assets/projects/wireless-mouse-1.png', '/assets/projects/wireless-mouse-2.png'],
    accentColor: '#06b6d4',
    architectureGraph: {
      nodes: [
        { id: 'wm-touch', label: 'Flutter Multi-Touch Trackpad', layer: 'Presentation', x: 90, y: 160, description: 'Sub-pixel gesture tracker with dynamic velocity curves' },
        { id: 'wm-client', label: 'WebSocket Packet Client', layer: 'Network', x: 290, y: 160, description: 'Binary frame serializer with delta-compression & heartbeat' },
        { id: 'wm-server', label: '.NET Background Daemon', layer: 'Domain', x: 490, y: 160, description: 'Multi-threaded socket server with AES session validation' },
        { id: 'wm-win32', label: 'Win32 SendInput Driver', layer: 'Hardware', x: 690, y: 90, description: 'Native OS cursor injection via P/Invoke kernel calls' },
        { id: 'wm-config', label: 'Registry & Config Engine', layer: 'Data', x: 690, y: 230, description: 'Persistent device pairing keys and DPI acceleration curves' },
      ],
      flows: [
        { from: 'wm-touch', to: 'wm-client', label: 'Gesture Deltas' },
        { from: 'wm-client', to: 'wm-server', label: 'Binary UDP/WS Frames' },
        { from: 'wm-server', to: 'wm-win32', label: 'Direct Input Injection' },
        { from: 'wm-server', to: 'wm-config', label: 'Verify Paired Client' },
      ],
    },
    architectureHighlights: [
      'Microsecond input synthesis via native Win32 SendInput P/Invoke bindings',
      'High-frequency binary packet serialization over local Wi-Fi WebSockets',
      'Multi-finger gesture detection with sub-pixel cursor movement curves',
    ],
    metrics: [
      { label: 'Input Latency', value: '< 8ms', detail: 'Local network round-trip + OS injection' },
      { label: 'Polling Rate', value: '120Hz', detail: 'High-frequency touch delta updates' },
      { label: 'CPU Usage', value: '< 0.5%', detail: 'Optimized lightweight C# background task' },
    ],
    codeSnippet: {
      filename: 'InputSynthesisDriver.cs',
      language: 'csharp',
      description: 'P/Invoke Win32 SendInput synthesis driver executing kernel mouse displacement events.',
      code: `public class InputSynthesisDriver : IInputDriver
{
    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, [MarshalAs(UnmanagedType.LPArray), In] INPUT[] pInputs, int cbSize);

    public void InjectMouseDelta(int dx, int dy, MouseAction action)
    {
        var input = new INPUT
        {
            type = INPUT_MOUSE,
            u = new InputUnion
            {
                mi = new MOUSEINPUT
                {
                    dx = dx,
                    dy = dy,
                    dwFlags = MOUSEEVENTF_MOVE | ParseActionFlags(action),
                    time = 0,
                    dwExtraInfo = UIntPtr.Zero
                }
            }
        };

        SendInput(1, new[] { input }, Marshal.SizeOf(typeof(INPUT)));
    }
}`,
    },
  },
];
