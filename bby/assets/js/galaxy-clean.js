class GalaxyVisualization {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.centralSphere = null;
        this.imageParticles = [];
        this.constellationLines = [];
        this.backgroundParticles = null;
        this.nebulaSystem = null;
        
        // Energy rings for "I LOVE YOU" text
        this.textRings = [];
        this.sphereTextRings = [];
        this.animateTextRings = null;
        this.animateSphereTextRings = null;
        
        // Simple background music
        this.backgroundMusic = null;
        
        this.files = [];
        this.isZoomedOut = true; // Start in zoomed out state to show full galaxy
        this.isTransitioning = false; // Track smooth transitions
        this.showConstellations = false;
        this.animationId = null;
        this.mouseTimeout = null;
        this.lastMouseMove = Date.now();
        
        // Configuration
        this.config = {
            autoZoomTimeout: 1500, // 1.5 seconds of inactivity (even faster)
            orbitRadius: { min: 25, max: 45 }, // Increased distance from sphere
            particleCount: 300, // Optimized for performance
            spiralArms: 4,
            galaxyRadius: 100,
            rotationSpeed: 0.3, // Slower rotation speed
            zoomLevel: 65 // Increased zoom distance - MORE ZOOMED OUT
        };

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;

        this.init();
    }

    async init() {
        try {

            
            // Start background music IMMEDIATELY - no debug logging
            this.playBackgroundMusic();
            
            // Clear any browser cache
            if (typeof(Storage) !== "undefined") {
                localStorage.removeItem('galaxyFiles');
                sessionStorage.clear();
            }
            
            await this.initThreeJS();
            
            this.setupEventListeners();
            
            this.setupShareFunctionality();
            
            // Check if loading a shared galaxy first
            const isSharedGallery = await this.loadSharedGallery();
            if (!isSharedGallery) {
                await this.loadFiles(); // Only load regular files if not a shared galaxy
            }
            
            this.createGalaxyElements();
            
            this.startAnimation();
            
            this.hideLoadingScreen();
            
        } catch (error) {
            // Error during initialization
        }
    }

    initThreeJS() {
        // Scene with pure black background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); // Pure black
        this.scene.fog = new THREE.Fog(0x000000, 50, 200);

        // Camera - start in zoomed out position
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 50, 100); // Start in galaxy view position - ZOOMED OUT MORE
        this.camera.rotation.set(-0.5, 0, 0); // Start with galaxy viewing angle - BETTER PERSPECTIVE

        // Renderer with enhanced settings for 3D depth
        const canvasElement = document.getElementById('galaxyCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvasElement, 
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true; // Keep shadows for 3D depth
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.setClearColor(0x000000, 1); // Pure black

        // Enhanced lighting system for 3D sphere
        const ambientLight = new THREE.AmbientLight(0x6366f1, 0.3); // Purple ambient
        this.scene.add(ambientLight);

        // Main directional light with shadows
        const directionalLight = new THREE.DirectionalLight(0x8b5cf6, 1.2);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light at center for sphere illumination
        const pointLight = new THREE.PointLight(0x6366f1, 1.5, 100);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);

        // Additional rim lighting for 3D effect
        const rimLight1 = new THREE.PointLight(0xa855f7, 0.8, 50); // Purple rim light
        rimLight1.position.set(30, 30, 30);
        this.scene.add(rimLight1);

        const rimLight2 = new THREE.PointLight(0x4338ca, 0.8, 50); // Blue rim light
        rimLight2.position.set(-30, -30, 30);
        this.scene.add(rimLight2);
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Mouse interaction
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        window.addEventListener('click', (event) => this.onMouseClick(event));
        window.addEventListener('mouseleave', () => this.onMouseLeave());
        
        // Touch interaction for mobile
        window.addEventListener('touchmove', (event) => this.onTouchMove(event));
        window.addEventListener('touchend', () => this.onTouchEnd());
    }

    async loadFiles() {
        try {
            // Add cache-busting parameter
            const timestamp = new Date().getTime();
            const response = await fetch(`api/files.php?t=${timestamp}`);
            const data = await response.json();
            

            
            if (data.success) {
                this.files = data.files;
                this.updateLoadingText(`Loaded ${this.files.length} cosmic objects`);
            }
        } catch (error) {
            // Failed to load files from API
            this.updateLoadingText('Failed to load cosmic objects');
        }
    }

    updateLoadingText(text) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    // Show romantic welcome message after loading screen disappears
                    this.showRomanticMessage();
                }, 1000);
            }
        }, 2000);
    }

    showRomanticMessage() {
        setTimeout(() => {
            const romanticMessage = document.getElementById('romanticMessage');
            if (romanticMessage) {
                romanticMessage.classList.add('show');
                
                // Hide the message after 3 seconds
                setTimeout(() => {
                    romanticMessage.classList.remove('show');
                }, 3000);
            }
        }, 1000); // Delay to let galaxy settle
    }

    createGalaxyElements() {
        this.createCentralSphere();
        this.createImageParticles();
        this.createDebrisField(); // Add more debris particles
        this.createBackgroundParticles();
        this.createNebula();
        
        // Create "I LOVE YOU" text energy rings
        this.createTextEnergyRings();
        this.createSphereTextRings();
        
        this.updateLoadingText('Loading Memories of us...');
        
        // Initialize zoomed out state after elements are created
        setTimeout(() => {
            this.initializeZoomedOutState();
        }, 1000);
    }

    createCentralSphere() {
        // Create a majestic supernova-like light-emitting sphere
        const geometry = new THREE.SphereGeometry(8, 128, 64);
        
        // Supernova material with vivid spiral galaxy colors
        const material = new THREE.MeshStandardMaterial({
            color: 0xfb00ff, // Bright magenta core (matching spiral galaxy)
            emissive: 0xef3b9f, // Vibrant pink emission
            emissiveIntensity: 1.8, // Very bright emission for supernova effect
            metalness: 0.0, // Pure plasma, no metallic properties
            roughness: 0.9, // Very rough surface like stellar plasma
            transparent: false,
            opacity: 1.0
        });

        this.centralSphere = new THREE.Mesh(geometry, material);
        
        // Add multiple energy layers for supernova effect with galaxy colors
        const energyGeometry1 = new THREE.SphereGeometry(9, 64, 32);
        const energyMaterial1 = new THREE.MeshBasicMaterial({
            color: 0xda00ff, // Bright purple energy layer
            transparent: true,
            opacity: 0.7,
            side: THREE.BackSide
        });
        this.energyLayer1 = new THREE.Mesh(energyGeometry1, energyMaterial1);
        
        const energyGeometry2 = new THREE.SphereGeometry(10.5, 32, 16);
        const energyMaterial2 = new THREE.MeshBasicMaterial({
            color: 0xb900ff, // Deep magenta energy layer
            transparent: true,
            opacity: 0.5,
            side: THREE.BackSide
        });
        this.energyLayer2 = new THREE.Mesh(energyGeometry2, energyMaterial2);
        
        // Supernova explosion layers with galaxy-themed colors
        const explosionGeometry1 = new THREE.SphereGeometry(12, 32, 16);
        const explosionMaterial1 = new THREE.MeshBasicMaterial({
            color: 0x9400d3, // Violet explosion layer
            transparent: true,
            opacity: 0.4,
            side: THREE.BackSide
        });
        this.explosionLayer1 = new THREE.Mesh(explosionGeometry1, explosionMaterial1);
        
        const explosionGeometry2 = new THREE.SphereGeometry(14, 32, 16);
        const explosionMaterial2 = new THREE.MeshBasicMaterial({
            color: 0x6a0dad, // Dark orchid outer shock wave
            transparent: true,
            opacity: 0.25,
            side: THREE.BackSide
        });
        this.explosionLayer2 = new THREE.Mesh(explosionGeometry2, explosionMaterial2);
        
        this.scene.add(this.energyLayer1);
        this.scene.add(this.energyLayer2);
        this.scene.add(this.explosionLayer1);
        this.scene.add(this.explosionLayer2);
        this.scene.add(this.centralSphere);

        // Supernova animation with dramatic pulsing and energy waves
        const supernovaAnimation = () => {
            const time = Date.now() * 0.001;
            
            // Core sphere intense pulsing like a supernova with enhanced brightness
            this.centralSphere.material.emissiveIntensity = 1.8 + Math.sin(time * 3) * 1.0; // More dramatic pulsing
            this.centralSphere.scale.setScalar(1 + Math.sin(time * 2.5) * 0.15); // Large scale changes
            this.centralSphere.rotation.y += 0.02; // Faster rotation
            
            // Energy layers with wave-like motion
            this.energyLayer1.material.opacity = 0.6 + Math.sin(time * 2.2) * 0.3;
            this.energyLayer1.scale.setScalar(1 + Math.sin(time * 2) * 0.2);
            this.energyLayer1.rotation.y -= 0.015;
            this.energyLayer1.rotation.x += 0.01;
            
            this.energyLayer2.material.opacity = 0.4 + Math.sin(time * 1.8) * 0.2;
            this.energyLayer2.scale.setScalar(1 + Math.sin(time * 1.6) * 0.25);
            this.energyLayer2.rotation.y += 0.012;
            this.energyLayer2.rotation.z -= 0.008;
            
            // Explosion waves with expanding motion
            this.explosionLayer1.material.opacity = 0.3 + Math.sin(time * 1.4) * 0.15;
            this.explosionLayer1.scale.setScalar(1 + Math.sin(time * 1.2) * 0.3);
            this.explosionLayer1.rotation.y += 0.008;
            
            this.explosionLayer2.material.opacity = 0.2 + Math.sin(time * 1) * 0.1;
            this.explosionLayer2.scale.setScalar(1 + Math.sin(time * 0.8) * 0.35);
            this.explosionLayer2.rotation.y -= 0.005;
        };

        this.centralSphere.userData = { animate: supernovaAnimation };
    }

    createImageParticles() {
        this.files.forEach((file, index) => {
            this.createImageParticle(file, index);
        });
    }

    createImageParticle(file, index) {
        const textureLoader = new THREE.TextureLoader();
        
        // Try thumbnail first, fallback to original image  
        const imageUrl = file.thumbnail && file.thumbnail !== file.path ? file.thumbnail : file.path;
        

        
        textureLoader.load(
            imageUrl,
            (texture) => {

                this.createParticleFromTexture(texture, file, index);
            },
            (progress) => {

            },
            (error) => {
                // Failed to load texture, trying fallback...
                
                // Try fallback to original image if thumbnail failed
                if (imageUrl !== file.path) {

                    textureLoader.load(
                        file.path,
                        (texture) => {

                            this.createParticleFromTexture(texture, file, index);
                        },
                        undefined,
                        (fallbackError) => {
                            // Failed to load both thumbnail and original image
                            // Using fallback texture
                            // Create a colored particle without texture
                            this.createColoredParticle(file, index);
                        }
                    );
                } else {
                    // Failed to load image, using fallback
                    // Create a colored particle without texture
                    this.createColoredParticle(file, index);
                }
            }
        );
    }

    createParticleFromTexture(texture, file, index) {
        // Ensure texture settings for better quality
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        // Create particle for zoomed out view - WHITE for debris effect with larger size
        const particleGeometry = new THREE.SphereGeometry(0.8, 8, 8); // Much larger for better visibility
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff, // White color for debris effect
            transparent: false, // Remove transparency
            opacity: 1.0 // Fully opaque
        });

        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // Create image plane for zoomed in view with proper aspect ratio
        const planeGeometry = new THREE.PlaneGeometry(4, 4); // Slightly smaller to fit better in expanded orbit
        const planeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.1 // Helps with transparency
        });

        const imagePlane = new THREE.Mesh(planeGeometry, planeMaterial);
        
        this.setupParticlePosition(particle, imagePlane, file, index);
    }

    createColoredParticle(file, index) {
        // Create particle for zoomed out view - WHITE for debris effect with larger size
        const particleGeometry = new THREE.SphereGeometry(0.8, 8, 8); // Much larger for better visibility
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff, // White color for debris effect
            transparent: false, // Remove transparency
            opacity: 1.0 // Fully opaque
        });

        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // Create colored plane for zoomed in view (fallback)
        const planeGeometry = new THREE.PlaneGeometry(4, 4); // Slightly smaller to fit better
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: this.getRandomParticleColor(),
            transparent: false, // Remove transparency
            opacity: 1.0 // Fully opaque
        });

        const imagePlane = new THREE.Mesh(planeGeometry, planeMaterial);
        
        this.setupParticlePosition(particle, imagePlane, file, index);
    }

    setupParticlePosition(particle, imagePlane, file, index) {
        // Position in orbit with better spacing from central sphere
        const angle = (index / this.files.length) * Math.PI * 2;
        const radius = this.config.orbitRadius.min + 
            Math.random() * (this.config.orbitRadius.max - this.config.orbitRadius.min);
        const height = (Math.random() - 0.5) * 15; // Increased height variation

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = height;

        particle.position.set(x, y, z);
        imagePlane.position.set(x, y, z);

        // Make image plane face camera initially
        imagePlane.lookAt(this.camera.position);

        // Store orbital parameters
        const orbitalData = {
            angle: angle,
            radius: radius,
            height: height,
            speed: 0.02 + Math.random() * 0.01,
            file: file,
            particle: particle,
            imagePlane: imagePlane,
            originalPosition: { x, y, z },
            spiralPosition: { x: 0, y: 0, z: 0 }
        };

        particle.userData = orbitalData;
        imagePlane.userData = orbitalData;

        // Add to scene and tracking
        this.scene.add(particle);
        this.scene.add(imagePlane);
        this.imageParticles.push(orbitalData);

        // Start in zoomed out state - show particles, hide image planes
        imagePlane.visible = false;
        particle.visible = true;
    }

    createDebrisField() {
        // Create well-defined spiral galaxy with clearly visible particles and gap from sphere
        this.debrisParticles = [];
        
        // Increased particle counts with gap from central sphere for supernova effect
        this.createSpiralDebrisLayer(1500, 18, 35, 3, []); // Start farther from sphere (gap)
        this.createSpiralDebrisLayer(1200, 32, 55, 4, []); // Main spiral arms
        this.createSpiralDebrisLayer(1000, 52, 75, 6, []); // Extended spiral arms
        this.createSpiralDebrisLayer(700, 72, 95, 8, []); // Outer spiral wisps
    }

    createSpiralDebrisLayer(count, minRadius, maxRadius, heightSpread, sizes) {
        const spiralArms = 2; // Two main spiral arms
        
        for (let arm = 0; arm < spiralArms; arm++) {
            const particlesPerArm = Math.floor(count / spiralArms);
            
            for (let i = 0; i < particlesPerArm; i++) {
                // Make particles much larger and more visible
                const size = Math.random() * 0.15 + 0.1; // Larger particles (0.1-0.25)
                
                // Simple geometry but larger
                const geometry = new THREE.SphereGeometry(size, 6, 6); // Increased detail for visibility
                
                const material = new THREE.MeshBasicMaterial({
                    color: 0xffffff, // Keep particles white
                    transparent: false, // Remove transparency for solid appearance
                    opacity: 1.0 // Fully opaque
                });

                const debris = new THREE.Mesh(geometry, material);
                
                // Create tight spiral arms - logarithmic spiral like real galaxies
                const t = i / particlesPerArm; // Progress along the arm (0 to 1)
                const radius = minRadius + t * (maxRadius - minRadius);
                
                // Spiral arm formula for realistic galaxy structure
                const armOffset = arm * Math.PI; // Arms 180° apart
                const spiralTightness = 1.2; // How tightly wound the spiral is
                const totalRotations = 3; // How many times the spiral wraps around
                
                // Calculate spiral angle - this creates the spiral shape
                const spiralAngle = armOffset + t * totalRotations * Math.PI * 2 * spiralTightness;
                
                // Add controlled randomness to make it look natural (but stay in spiral)
                const randomAngleOffset = (Math.random() - 0.5) * 0.1; // Reduced randomness for tighter spiral
                const randomRadiusOffset = (Math.random() - 0.5) * 1.5; // Smaller radius variation
                
                const finalAngle = spiralAngle + randomAngleOffset;
                const finalRadius = radius + randomRadiusOffset;
                
                // Reduced height variation for denser spiral
                const height = (Math.random() - 0.5) * (heightSpread * 0.7);
                
                // Position the particle in the spiral
                debris.position.set(
                    Math.cos(finalAngle) * finalRadius,
                    height,
                    Math.sin(finalAngle) * finalRadius
                );
                
                // Store data for animation
                debris.userData = {
                    angle: finalAngle,
                    radius: finalRadius,
                    height: height,
                    speed: 0.001 + Math.random() * 0.0005, // Slow, consistent rotation
                    isDebris: true,
                    twinklePhase: Math.random() * Math.PI * 2,
                    originalOpacity: material.opacity,
                    armIndex: arm,
                    spiralPosition: t // Position along spiral arm
                };
                
                this.scene.add(debris);
                this.debrisParticles.push(debris);
            }
        }
        
        // Initially hide all debris particles (they show only when zoomed out)
        this.debrisParticles.forEach(debris => {
            debris.visible = false;
        });
    }

    createBackgroundParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < this.config.particleCount; i++) {
            // More concentrated background particles
            positions.push(
                (Math.random() - 0.5) * 120,
                (Math.random() - 0.5) * 120,
                (Math.random() - 0.5) * 120
            );

            // Colors that match the new purple-blue gradient background
            const color = new THREE.Color();
            const colorChoice = Math.random();
            if (colorChoice < 0.4) {
                color.setHSL(0.75 + Math.random() * 0.1, 0.8, 0.7); // Purple range
            } else if (colorChoice < 0.7) {
                color.setHSL(0.65 + Math.random() * 0.1, 0.9, 0.6); // Blue-purple range
            } else {
                color.setHSL(0.6 + Math.random() * 0.05, 0.7, 0.8); // Blue range
            }
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.5, // Slightly larger for better visibility against new background
            vertexColors: true,
            transparent: true,
            opacity: 0.7 // More visible against the gradient
        });

        this.backgroundParticles = new THREE.Points(geometry, material);
        this.scene.add(this.backgroundParticles);
    }

    createNebula() {
        const geometry = new THREE.PlaneGeometry(50, 50);
        const material = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true, // Keep minimal transparency for nebula effect
            opacity: 0.05, // Very subtle
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 3; i++) {
            const nebula = new THREE.Mesh(geometry, material.clone());
            nebula.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );
            nebula.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            this.scene.add(nebula);
        }
    }

    createTextEnergyRings() {
        // Create font loader
        const fontLoader = new THREE.FontLoader();
        
        // Load font and create text rings
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            this.textRings = [];
            
            // Create 3 rings at different distances with "I LOVE YOU" text - positioned farther out
            const ringConfigs = [
                { radius: 50, text: "I LOVE YOU", color: 0xfb00ff, size: 0.8, speed: 0.005, height: 0 },
                { radius: 65, text: "I LOVE YOU", color: 0xda00ff, size: 0.6, speed: -0.003, height: 8 },
                { radius: 80, text: "I LOVE YOU", color: 0x9400d3, size: 0.5, speed: 0.002, height: -6 }
            ];
            
            ringConfigs.forEach((config, ringIndex) => {
                const textGroup = new THREE.Group();
                
                // Create curved text that follows the orbital path
                const textString = config.text + " • ";
                const textCopies = Math.ceil((config.radius * 2 * Math.PI) / (textString.length * config.size * 0.6)); // Calculate copies needed
                
                for (let i = 0; i < textCopies; i++) {
                    const angle = (i / textCopies) * Math.PI * 2;
                    
                    // Create individual characters for curved effect
                    for (let charIndex = 0; charIndex < textString.length; charIndex++) {
                        const char = textString[charIndex];
                        if (char === ' ') continue; // Skip spaces
                        
                        const charGeometry = new THREE.TextGeometry(char, {
                            font: font,
                            size: config.size,
                            height: 0.05,
                            curveSegments: 8,
                            bevelEnabled: true,
                            bevelThickness: 0.01,
                            bevelSize: 0.01,
                            bevelOffset: 0,
                            bevelSegments: 3
                        });
                        
                        const charMaterial = new THREE.MeshStandardMaterial({
                            color: config.color,
                            emissive: config.color,
                            emissiveIntensity: 0.6,
                            transparent: true,
                            opacity: 0.8
                        });
                        
                        const charMesh = new THREE.Mesh(charGeometry, charMaterial);
                        
                        // Position character along the curved path
                        const charAngle = angle + (charIndex * config.size * 0.8) / config.radius;
                        charMesh.position.x = Math.cos(charAngle) * config.radius;
                        charMesh.position.z = Math.sin(charAngle) * config.radius;
                        charMesh.position.y = config.height + Math.sin(charAngle * 3) * 2; // Add wave motion
                        
                        // Make character face outward from center with proper curve
                        charMesh.lookAt(
                            charMesh.position.x * 2,
                            charMesh.position.y,
                            charMesh.position.z * 2
                        );
                        charMesh.rotateY(Math.PI * 0.5); // Adjust orientation
                        
                        textGroup.add(charMesh);
                    }
                }
                
                textGroup.userData = {
                    speed: config.speed,
                    ringIndex: ringIndex,
                    baseHeight: config.height,
                    radius: config.radius
                };
                
                // Initially hide outer text rings when zoomed in (they show only when zoomed out)
                textGroup.visible = false;
                
                this.scene.add(textGroup);
                this.textRings.push(textGroup);
            });
            
            // Add animation for text rings
            const animateTextRings = () => {
                if (this.textRings && this.textRings.length > 0) {
                    const time = Date.now() * 0.001;
                    
                    this.textRings.forEach(ring => {
                        // Only animate outer rings if visible
                        if (!ring.visible) return;
                        
                        // Rotate the entire ring
                        ring.rotation.y += ring.userData.speed;
                        
                        // Animate individual characters
                        ring.children.forEach((charMesh, index) => {
                            // Pulsing emissive intensity
                            charMesh.material.emissiveIntensity = 0.6 + Math.sin(time * 2 + index * 0.1) * 0.3;
                            
                            // Gentle wave motion along the ring
                            const waveOffset = Math.sin(time * 1.5 + index * 0.2) * 1.5;
                            charMesh.position.y = ring.userData.baseHeight + waveOffset;
                            
                            // Slight scale pulsing
                            const scale = 1 + Math.sin(time * 3 + index * 0.2) * 0.05;
                            charMesh.scale.setScalar(scale);
                            
                            // Opacity variation for mystical effect
                            charMesh.material.opacity = 0.8 + Math.sin(time * 1.8 + index * 0.15) * 0.2;
                        });
                    });
                }
            };
            
            // Store animation function for the main animation loop
            this.animateTextRings = animateTextRings;
        });
    }

    createSphereTextRings() {
        // Create font loader for sphere text rings
        const fontLoader = new THREE.FontLoader();
        
        // Load font and create close orbit text rings around sphere
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            this.sphereTextRings = [];
            
            // Create multiple rings very close to the sphere with different orientations
            const sphereRingConfigs = [
                { 
                    radius: 18, 
                    text: "I LOVE YOU", 
                    color: 0xfb00ff, 
                    size: 0.6, 
                    speed: 0.015,
                    rotationAxis: { x: 0, y: 1, z: 0 }, // Horizontal ring
                    tilt: { x: 0, y: 0, z: 0 }
                },
                { 
                    radius: 20, 
                    text: "I LOVE YOU", 
                    color: 0xda00ff, 
                    size: 0.5, 
                    speed: -0.012,
                    rotationAxis: { x: 1, y: 0, z: 0 }, // Vertical ring (rotates around X)
                    tilt: { x: Math.PI / 2, y: 0, z: 0 }
                },
                { 
                    radius: 22, 
                    text: "I LOVE YOU", 
                    color: 0x9400d3, 
                    size: 0.4, 
                    speed: 0.008,
                    rotationAxis: { x: 0, y: 0, z: 1 }, // Diagonal ring (rotates around Z)
                    tilt: { x: 0, y: 0, z: Math.PI / 2 }
                },
                { 
                    radius: 24, 
                    text: "I LOVE YOU", 
                    color: 0x6a0dad, 
                    size: 0.35, 
                    speed: -0.006,
                    rotationAxis: { x: 1, y: 1, z: 0 }, // Diagonal ring
                    tilt: { x: Math.PI / 4, y: Math.PI / 4, z: 0 }
                }
            ];
            
            sphereRingConfigs.forEach((config, ringIndex) => {
                const sphereRingGroup = new THREE.Group();
                
                // Create curved text that follows the orbital path around sphere
                const textString = config.text + " • ";
                const textCopies = Math.ceil((config.radius * 2 * Math.PI) / (textString.length * config.size * 0.8));
                
                for (let i = 0; i < textCopies; i++) {
                    const angle = (i / textCopies) * Math.PI * 2;
                    
                    // Create individual characters for curved effect
                    for (let charIndex = 0; charIndex < textString.length; charIndex++) {
                        const char = textString[charIndex];
                        if (char === ' ') continue; // Skip spaces
                        
                        const charGeometry = new THREE.TextGeometry(char, {
                            font: font,
                            size: config.size,
                            height: 0.03,
                            curveSegments: 6,
                            bevelEnabled: true,
                            bevelThickness: 0.005,
                            bevelSize: 0.005,
                            bevelOffset: 0,
                            bevelSegments: 2
                        });
                        
                        const charMaterial = new THREE.MeshStandardMaterial({
                            color: config.color,
                            emissive: config.color,
                            emissiveIntensity: 0.8,
                            transparent: true,
                            opacity: 0.9
                        });
                        
                        const charMesh = new THREE.Mesh(charGeometry, charMaterial);
                        
                        // Position character along the curved path around sphere
                        const charAngle = angle + (charIndex * config.size * 0.9) / config.radius;
                        charMesh.position.x = Math.cos(charAngle) * config.radius;
                        charMesh.position.z = Math.sin(charAngle) * config.radius;
                        charMesh.position.y = Math.sin(charAngle * 4) * 0.5; // Subtle wave
                        
                        // Make character face outward from sphere
                        charMesh.lookAt(
                            charMesh.position.x * 2,
                            charMesh.position.y,
                            charMesh.position.z * 2
                        );
                        charMesh.rotateY(Math.PI * 0.5);
                        
                        sphereRingGroup.add(charMesh);
                    }
                }
                
                // Apply ring orientation/tilt
                sphereRingGroup.rotation.set(config.tilt.x, config.tilt.y, config.tilt.z);
                
                sphereRingGroup.userData = {
                    speed: config.speed,
                    ringIndex: ringIndex,
                    radius: config.radius,
                    rotationAxis: config.rotationAxis,
                    baseRotation: { ...config.tilt }
                };
                
                this.scene.add(sphereRingGroup);
                this.sphereTextRings.push(sphereRingGroup);
            });
            
            // Add animation for sphere text rings
            const animateSphereTextRings = () => {
                if (this.sphereTextRings && this.sphereTextRings.length > 0) {
                    const time = Date.now() * 0.001;
                    
                    this.sphereTextRings.forEach(ring => {
                        // Rotate ring around its specific axis
                        const axis = ring.userData.rotationAxis;
                        if (axis.x !== 0) ring.rotation.x += ring.userData.speed * axis.x;
                        if (axis.y !== 0) ring.rotation.y += ring.userData.speed * axis.y;
                        if (axis.z !== 0) ring.rotation.z += ring.userData.speed * axis.z;
                        
                        // Animate individual characters
                        ring.children.forEach((charMesh, index) => {
                            // Intense pulsing emissive intensity for sphere rings
                            charMesh.material.emissiveIntensity = 0.8 + Math.sin(time * 3 + index * 0.15) * 0.5;
                            
                            // Subtle scale pulsing
                            const scale = 1 + Math.sin(time * 4 + index * 0.25) * 0.08;
                            charMesh.scale.setScalar(scale);
                            
                            // Opacity variation for energy effect
                            charMesh.material.opacity = 0.9 + Math.sin(time * 2.5 + index * 0.2) * 0.1;
                        });
                    });
                }
            };
            
            // Store animation function
            this.animateSphereTextRings = animateSphereTextRings;
        });
    }

    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            // Update TWEEN animations for smooth transitions
            TWEEN.update();

            // Update orbital motion
            this.updateOrbitalMotion();

            // Update central sphere animation
            if (this.centralSphere && this.centralSphere.userData.animate) {
                this.centralSphere.userData.animate();
            }

            // Animate text energy rings
            if (this.animateTextRings) {
                this.animateTextRings();
            }

            // Animate sphere text rings
            if (this.animateSphereTextRings) {
                this.animateSphereTextRings();
            }

            // Rotate background particles slowly
            if (this.backgroundParticles) {
                this.backgroundParticles.rotation.y += 0.001 * this.config.rotationSpeed;
            }

            // Check for auto zoom out
            this.checkAutoZoomOut();

            // Update raycast for hover effects
            this.updateRaycast();

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    updateOrbitalMotion() {
        // Dynamic speed based on zoom state for better trail visibility
        const speedMultiplier = this.isZoomedOut ? 4.0 : 1.0; // 4x speed when zoomed out for clear trails
        
        this.imageParticles.forEach(data => {
            if (this.isZoomedOut) {
                // Spiral galaxy motion for photo particles - FASTER WHEN ZOOMED OUT
                const time = Date.now() * 0.001;
                const spiralAngle = data.angle + time * data.speed * speedMultiplier;
                const spiralRadius = data.radius + Math.sin(time * 0.5) * 5;
                
                // Calculate spiral arm position
                const armIndex = Math.floor(data.angle / (Math.PI * 2 / this.config.spiralArms));
                const armAngle = spiralAngle + armIndex * (Math.PI * 2 / this.config.spiralArms);
                
                data.spiralPosition.x = Math.cos(armAngle) * spiralRadius;
                data.spiralPosition.z = Math.sin(armAngle) * spiralRadius;
                data.spiralPosition.y = data.height + Math.sin(time + data.angle) * 2;

                // Update particle position (if visible)
                if (data.particle.visible) {
                    data.particle.position.copy(data.spiralPosition);
                }
                // Keep image plane position updated but hidden
                data.imagePlane.position.copy(data.spiralPosition);
            } else {
                // Regular orbital motion - SLOWER WHEN ZOOMED IN
                data.angle += data.speed * this.config.rotationSpeed * speedMultiplier;
                const x = Math.cos(data.angle) * data.radius;
                const z = Math.sin(data.angle) * data.radius;
                
                // Update both particle and image plane positions
                data.particle.position.set(x, data.height, z);
                data.imagePlane.position.set(x, data.height, z);
                
                // Make image plane face camera when visible
                if (data.imagePlane.visible) {
                    data.imagePlane.lookAt(this.camera.position);
                }
            }
        });

        // Animate debris particles with optimized performance and spiral motion
        if (this.debrisParticles && this.debrisParticles.length > 0) {
            const time = Date.now() * 0.001;
            this.debrisParticles.forEach(debris => {
                if (this.isZoomedOut) {
                    // When zoomed out, maintain spiral structure and motion
                    debris.userData.angle += debris.userData.speed * speedMultiplier;
                    
                    // Keep spiral arm structure intact
                    const spiralRadius = debris.userData.radius;
                    const spiralAngle = debris.userData.angle;
                    
                    const x = Math.cos(spiralAngle) * spiralRadius;
                    const z = Math.sin(spiralAngle) * spiralRadius;
                    debris.position.set(x, debris.userData.height, z);
                    
                    // Make particles visible and bright when zoomed out
                    debris.visible = true;
                    debris.material.opacity = Math.min(1.0, debris.userData.originalOpacity * 1.8);
                    debris.scale.setScalar(2.0); // Scale up 2x when zoomed out
                } else {
                    // When zoomed in, HIDE debris particles to not block photos
                    debris.visible = false;
                    debris.scale.setScalar(1.0); // Reset scale
                }
                
                // Only apply twinkling if particle is visible
                if (debris.visible) {
                    debris.userData.twinklePhase += 0.02;
                    const twinkleFactor = 0.8 + Math.sin(debris.userData.twinklePhase) * 0.2;
                    debris.material.opacity *= twinkleFactor;
                }
            });
        }
    }

    onMouseMove(event) {
        this.lastMouseMove = Date.now();
        
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Smooth auto zoom in when mouse is moving
        if (this.isZoomedOut && !this.isTransitioning) {
            this.smoothZoomIn();
        }
    }

    onTouchMove(event) {
        event.preventDefault();
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            this.lastMouseMove = Date.now();
            
            // Smooth auto zoom in when touch is moving
            if (this.isZoomedOut && !this.isTransitioning) {
                this.smoothZoomIn();
            }
        }
    }

    onTouchEnd() {
        // Remove auto-zoom on touch end, now controlled by movement/inactivity
    }

    onMouseClick(event) {
        // Remove click-to-zoom, now controlled by movement/inactivity
    }

    onMouseLeave() {
        // Smooth zoom out when mouse leaves the window
        if (!this.isZoomedOut && !this.isTransitioning) {
            this.smoothZoomOut();
        }
    }

    checkAutoZoomOut() {
        if (!this.isZoomedOut && !this.isTransitioning && Date.now() - this.lastMouseMove > this.config.autoZoomTimeout) {
            this.smoothZoomOut();
        }
    }

    updateRaycast() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersectableObjects = this.imageParticles.map(data => 
            this.isZoomedOut ? data.particle : data.imagePlane
        ).filter(obj => obj.visible);

        const intersects = this.raycaster.intersectObjects(intersectableObjects);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (this.hoveredObject !== object) {
                this.hoveredObject = object;
                // Add hover effect
                object.scale.setScalar(1.2);
            }
        } else if (this.hoveredObject) {
            // Remove hover effect
            this.hoveredObject.scale.setScalar(1);
            this.hoveredObject = null;
        }
    }

    smoothZoomOut() {
        if (this.isTransitioning || this.isZoomedOut) return;
        
        this.isTransitioning = true;
        this.isZoomedOut = true;
        
        // Fast camera transition to galaxy view
        new TWEEN.Tween(this.camera.position)
            .to({ x: 0, y: 50, z: 100 }, 800) // Much faster - MORE ZOOMED OUT
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        new TWEEN.Tween(this.camera.rotation)
            .to({ x: -0.5, y: 0, z: 0 }, 800) // Much faster - BETTER PERSPECTIVE
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
                this.isTransitioning = false;
            })
            .start();

        // Instant particle transition - show particles immediately
        this.imageParticles.forEach((data, index) => {
            // Immediate visibility change
            data.imagePlane.visible = false;
            data.imagePlane.material.opacity = 1;
            data.particle.visible = true;
            data.particle.scale.setScalar(1);
            
            // Optional: slight scale effect for visual feedback
            new TWEEN.Tween(data.particle.scale)
                .to({ x: 1.2, y: 1.2, z: 1.2 }, 200)
                .easing(TWEEN.Easing.Back.Out)
                .yoyo(true)
                .repeat(1)
                .start();
        });

        // Fast debris particles fade in
        if (this.debrisParticles) {
            this.debrisParticles.forEach((debris, index) => {
                debris.visible = true;
                debris.material.opacity = Math.min(1.0, debris.userData.originalOpacity * 1.8);
                debris.scale.setScalar(2.0);
            });
        }

        // Show outer text energy rings when zoomed out
        if (this.textRings) {
            this.textRings.forEach(ring => {
                ring.visible = true;
            });
        }
    }

    smoothZoomIn() {
        if (this.isTransitioning || !this.isZoomedOut) return;
        
        this.isTransitioning = true;
        this.isZoomedOut = false;
        
        // Very fast camera transition to close view
        new TWEEN.Tween(this.camera.position)
            .to({ x: 0, y: 0, z: this.config.zoomLevel }, 600) // Much faster
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        new TWEEN.Tween(this.camera.rotation)
            .to({ x: 0, y: 0, z: 0 }, 600) // Much faster
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
                this.isTransitioning = false;
            })
            .start();

        // Instant particle transition - show images immediately
        this.imageParticles.forEach((data, index) => {
            // Immediate visibility change
            data.particle.visible = false;
            data.particle.scale.setScalar(1);
            data.imagePlane.visible = true;
            data.imagePlane.material.opacity = 1; // Instant full opacity
        });

        // Smooth debris particles fade out - faster
        if (this.debrisParticles) {
            this.debrisParticles.forEach((debris, index) => {
                new TWEEN.Tween(debris.material)
                    .to({ opacity: 0 }, 400) // Much faster
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onComplete(() => {
                        debris.visible = false;
                    })
                    .start();
                
                new TWEEN.Tween(debris.scale)
                    .to({ x: 1.0, y: 1.0, z: 1.0 }, 400) // Much faster
                    .easing(TWEEN.Easing.Quadratic.In)
                    .start();
            });
        }

        // Hide outer text energy rings when zoomed in (keep sphere rings visible)
        if (this.textRings) {
            this.textRings.forEach(ring => {
                ring.visible = false;
            });
        }
    }

    initializeZoomedOutState() {
        // Set up initial zoomed out state
        if (this.isZoomedOut) {
            // Show debris particles
            if (this.debrisParticles) {
                this.debrisParticles.forEach(debris => {
                    debris.visible = true;
                    debris.material.opacity = Math.min(1.0, debris.userData.originalOpacity * 1.8);
                    debris.scale.setScalar(2.0);
                });
            }
            
            // Show outer text rings when zoomed out
            if (this.textRings) {
                this.textRings.forEach(ring => {
                    ring.visible = true;
                });
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Share functionality methods
    setupShareFunctionality() {
        const shareBtn = document.getElementById('shareBtn');
        const shareModal = document.getElementById('shareModal');
        const closeModal = document.getElementById('closeModal');
        const copyLinkBtn = document.getElementById('copyLinkBtn');
        const shareLink = document.getElementById('shareLink');
        const shareOptions = document.querySelectorAll('.share-option');

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.generateShareLink();
                shareModal.style.display = 'flex';
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                shareModal.style.display = 'none';
            });
        }

        if (shareModal) {
            shareModal.addEventListener('click', (e) => {
                if (e.target === shareModal) {
                    shareModal.style.display = 'none';
                }
            });
        }

        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                shareLink.select();
                shareLink.setSelectionRange(0, 99999);
                document.execCommand('copy');
                
                // Visual feedback
                copyLinkBtn.textContent = 'Copied!';
                copyLinkBtn.style.background = '#22c55e';
                setTimeout(() => {
                    copyLinkBtn.textContent = 'Copy';
                    copyLinkBtn.style.background = '';
                }, 2000);
            });
        }

        // Social sharing options
        shareOptions.forEach(option => {
            option.addEventListener('click', () => {
                const platform = option.dataset.platform;
                const url = shareLink.value;
                const title = '💖 Check out our Galaxy of Love! 💖';
                const description = 'Every memory orbits around our love in this cosmic visualization ✨';
                
                this.shareToSocial(platform, url, title, description);
            });
        });
    }

    async generateShareLink() {
        // Get current domain and protocol for deployment
        const protocol = window.location.protocol;
        const host = window.location.host;
        const pathname = window.location.pathname;
        
        // Generate a unique gallery ID based on current files
        const galleryId = this.generateGalleryId();
        
        // Create shareable URL
        const shareUrl = `${protocol}//${host}${pathname.replace('galaxy.html', '')}galaxy.html?gallery=${galleryId}`;
        
        document.getElementById('shareLink').value = shareUrl;
        
        // Save gallery state both locally and on server
        await this.saveGalleryState(galleryId);
        
        return shareUrl;
    }

    generateGalleryId() {
        // Create a unique ID based on the files in the gallery
        const fileData = this.files.map(f => f.filename).sort().join('|');
        const timestamp = Date.now();
        
        // Simple hash function for gallery ID
        let hash = 0;
        const combined = fileData + timestamp;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36) + timestamp.toString(36);
    }

    async saveGalleryState(galleryId) {
        // Save the current gallery state to localStorage for sharing
        const galleryState = {
            id: galleryId,
            files: this.files,
            timestamp: Date.now(),
            title: '💖 Our Galaxy of Love 💖'
        };
        
        // Save locally first (for immediate access)
        localStorage.setItem(`galaxy_${galleryId}`, JSON.stringify(galleryState));
        
        // Save to server for persistence across sessions and devices
        try {
            const response = await fetch('api/share.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    galleryId: galleryId,
                    files: this.files,
                    title: galleryState.title
                })
            });
            
            const result = await response.json();
            if (result.success) {

            } else {
                // Failed to save galaxy to server
            }
        } catch (error) {
            // Error saving galaxy to server
            // Continue with local storage only
        }
        
        // Also save to a shared galleries index locally
        const sharedGalleries = JSON.parse(localStorage.getItem('sharedGalleries') || '[]');
        sharedGalleries.push({
            id: galleryId,
            timestamp: Date.now(),
            fileCount: this.files.length,
            title: galleryState.title
        });
        
        // Keep only the last 10 shared galleries
        if (sharedGalleries.length > 10) {
            sharedGalleries.splice(0, sharedGalleries.length - 10);
        }
        
        localStorage.setItem('sharedGalleries', JSON.stringify(sharedGalleries));
    }

    async loadSharedGallery() {
        // Check if we're loading a shared gallery
        const urlParams = new URLSearchParams(window.location.search);
        const galleryId = urlParams.get('gallery');
        
        if (galleryId) {
            // Try to load from server first
            try {
                const response = await fetch(`api/share.php?id=${galleryId}`);
                const result = await response.json();
                
                if (result.success && result.gallery) {
                    this.files = result.gallery.files || [];
                    
                    // Increment view count
                    fetch(`api/share.php?id=${galleryId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ incrementViews: true })
                    }).catch(err => {/* Silent error for view count */});
                    
                    // Show romantic welcome message for shared galleries
                    this.showSharedGalleryMessage(result.gallery);
                    
                    return true; // Successfully loaded shared gallery from server
                }
            } catch (error) {
                // Could not load from server, trying local storage
            }
            
            // Fallback to local storage
            const savedGallery = localStorage.getItem(`galaxy_${galleryId}`);
            if (savedGallery) {
                try {
                    const galleryState = JSON.parse(savedGallery);
                    this.files = galleryState.files || [];
                    
                    // Show romantic welcome message for shared galleries
                    this.showSharedGalleryMessage(galleryState);
                    
                    return true; // Successfully loaded shared gallery from local storage
                } catch (error) {
                    // Failed to load shared gallery from local storage
                }
            }
            
            // If we reach here, the gallery wasn't found
            this.showGalleryNotFoundMessage();
        }
        
        return false; // No shared gallery to load
    }

    showSharedGalleryMessage(galleryState) {
        const romanticMessage = document.getElementById('romanticMessage');
        if (romanticMessage) {
            const messageContent = romanticMessage.querySelector('.message-content');
            if (messageContent) {
                messageContent.innerHTML = `
                    <h3>💕 Welcome to a Special Galaxy 💕</h3>
                    <p>Someone has shared their precious memories with you...</p>
                    <p>✨ ${galleryState.files.length} memories are waiting to be explored ✨</p>
                `;
                
                romanticMessage.style.display = 'flex';
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    romanticMessage.style.opacity = '0';
                    setTimeout(() => {
                        romanticMessage.style.display = 'none';
                        romanticMessage.style.opacity = '1';
                    }, 1000);
                }, 5000);
            }
        }
    }

    showGalleryNotFoundMessage() {
        const romanticMessage = document.getElementById('romanticMessage');
        if (romanticMessage) {
            const messageContent = romanticMessage.querySelector('.message-content');
            if (messageContent) {
                messageContent.innerHTML = `
                    <h3>💫 Galaxy Not Found 💫</h3>
                    <p>This shared galaxy may have expired or moved to another universe...</p>
                    <p><a href="index.html" style="color: #e879f9; text-decoration: underline;">Create your own galaxy</a></p>
                `;
                
                romanticMessage.style.display = 'flex';
                
                // Auto-hide after 8 seconds
                setTimeout(() => {
                    romanticMessage.style.opacity = '0';
                    setTimeout(() => {
                        romanticMessage.style.display = 'none';
                        romanticMessage.style.opacity = '1';
                    }, 1000);
                }, 8000);
            }
        }
    }

    shareToSocial(platform, url, title, description) {
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        const encodedDescription = encodeURIComponent(description);
        
        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'email':
                const subject = encodedTitle;
                const body = encodeURIComponent(`${description}\n\nView the galaxy here: ${url}`);
                shareUrl = `mailto:?subject=${subject}&body=${body}`;
                break;
            default:
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    playBackgroundMusic() {
        try {
            // Create audio element for background music
            this.backgroundMusic = new Audio();
            
            // You can replace this URL with your music file
            // Place your music file in assets/audio/ folder
            this.backgroundMusic.src = 'assets/audio/galaxy-music.mp3';
            
            // Configure audio settings - INCREASED VOLUME & INSTANT PLAY
            this.backgroundMusic.loop = true; // Loop the music
            this.backgroundMusic.volume = 0.7; // INCREASED to 70% volume
            this.backgroundMusic.preload = 'auto';
            this.backgroundMusic.autoplay = true; // Try autoplay
            
            // Load and try to play immediately - NO DEBUG LOGGING
            this.backgroundMusic.load();
            
            // Try to play the music immediately
            const playPromise = this.backgroundMusic.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // Music started playing - no logging
                    })
                    .catch(error => {
                        // Auto-play was prevented, try on first user interaction
                        this.setupMusicOnInteraction();
                    });
            }
            
        } catch (error) {
            // Silent error handling - no console output
        }
    }

    setupMusicOnInteraction() {
        // Play music on first user interaction (click, touch, etc.)
        const playMusicOnce = () => {
            if (this.backgroundMusic && this.backgroundMusic.paused) {
                this.backgroundMusic.play()
                    .then(() => {
                        // Music started - no logging
                    })
                    .catch(e => {
                        // Silent error handling
                    });
            }
            // Remove listeners after first interaction
            document.removeEventListener('click', playMusicOnce);
            document.removeEventListener('touchstart', playMusicOnce);
            document.removeEventListener('keydown', playMusicOnce);
        };
        
        // Add listeners for user interaction
        document.addEventListener('click', playMusicOnce);
        document.addEventListener('touchstart', playMusicOnce);
        document.addEventListener('keydown', playMusicOnce);
    }
}

// Animation loop for TWEEN
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
}
animate();

// Initialize galaxy when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GalaxyVisualization();
});