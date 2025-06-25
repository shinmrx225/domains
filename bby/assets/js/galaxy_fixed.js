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
        
        this.files = [];
        this.isZoomedOut = false;
        this.showConstellations = false;
        this.animationId = null;
        this.mouseTimeout = null;
        this.lastMouseMove = Date.now();
        
        // Configuration
        this.config = {
            autoZoomTimeout: 5000, // 5 seconds of inactivity
            orbitRadius: { min: 15, max: 35 },
            particleCount: 200,
            spiralArms: 4,
            galaxyRadius: 100,
            rotationSpeed: 1,
            zoomLevel: 30
        };

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;

        this.init();
    }

    async init() {
        try {
            await this.initThreeJS();
            this.setupEventListeners();
            await this.loadFiles();
            this.createGalaxyElements();
            this.startAnimation();
            this.hideLoadingScreen();
        } catch (error) {
            console.error('Failed to initialize galaxy:', error);
        }
    }

    initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a1a, 50, 200);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, this.config.zoomLevel);

        // Renderer
        const canvas = document.getElementById('galaxyCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x0a0a1a, 1);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x6366f1, 1, 100);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);

        // Additional rim lighting
        const rimLight1 = new THREE.PointLight(0x06d6a0, 0.5, 50);
        rimLight1.position.set(30, 30, 30);
        this.scene.add(rimLight1);

        const rimLight2 = new THREE.PointLight(0x8b5cf6, 0.5, 50);
        rimLight2.position.set(-30, -30, 30);
        this.scene.add(rimLight2);
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Mouse interaction
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        window.addEventListener('click', (event) => this.onMouseClick(event));
        
        // Touch interaction for mobile
        window.addEventListener('touchmove', (event) => this.onTouchMove(event));
        window.addEventListener('touchend', () => this.onTouchEnd());

        // Controls
        document.getElementById('zoomSlider').addEventListener('input', (e) => {
            this.config.zoomLevel = parseFloat(e.target.value);
            this.updateCameraPosition();
        });

        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.config.rotationSpeed = parseFloat(e.target.value);
        });

        document.getElementById('densitySlider').addEventListener('input', (e) => {
            this.config.particleCount = parseInt(e.target.value);
            this.updateBackgroundParticles();
        });

        document.getElementById('toggleConstellations').addEventListener('click', () => {
            this.toggleConstellations();
        });

        document.getElementById('resetViewBtn').addEventListener('click', () => {
            this.resetView();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.showShareModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideShareModal();
        });

        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            this.copyShareLink();
        });

        // Share platform buttons
        document.querySelectorAll('.share-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.shareToplatform(e.target.dataset.platform);
            });
        });
    }

    async loadFiles() {
        try {
            const response = await fetch('api/files.php');
            const data = await response.json();
            
            if (data.success) {
                this.files = data.files;
                this.updateStats();
                this.updateLoadingText(`Loaded ${this.files.length} cosmic objects`);
            }
        } catch (error) {
            console.error('Failed to load files:', error);
            this.updateLoadingText('Failed to load cosmic objects');
        }
    }

    createGalaxyElements() {
        this.createCentralSphere();
        this.createImageParticles();
        this.createBackgroundParticles();
        this.createNebula();
        this.updateLoadingText('Assembling galaxy structure...');
    }

    createCentralSphere() {
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            emissive: 0x6366f1,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.8
        });

        this.centralSphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.centralSphere);

        // Add pulsing effect
        const pulseAnimation = () => {
            const time = Date.now() * 0.001;
            this.centralSphere.material.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.1;
            this.centralSphere.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
        };

        this.centralSphere.userData = { animate: pulseAnimation };
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
            undefined,
            (error) => {
                console.warn('Failed to load texture for:', file.name, 'trying fallback...');
                
                // Try fallback to original image if thumbnail failed
                if (imageUrl !== file.path) {
                    textureLoader.load(
                        file.path,
                        (texture) => {
                            this.createParticleFromTexture(texture, file, index);
                        },
                        undefined,
                        (fallbackError) => {
                            console.error('Failed to load both thumbnail and original image for:', file.name);
                            // Create a colored particle without texture
                            this.createColoredParticle(file, index);
                        }
                    );
                } else {
                    console.error('Failed to load image:', file.name);
                    // Create a colored particle without texture
                    this.createColoredParticle(file, index);
                }
            }
        );
    }

    createParticleFromTexture(texture, file, index) {
        // Create particle for zoomed out view
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: this.getRandomParticleColor(),
            transparent: true,
            opacity: 0.8
        });

        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // Create image plane for zoomed in view
        const planeGeometry = new THREE.PlaneGeometry(2, 2);
        const planeMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        const imagePlane = new THREE.Mesh(planeGeometry, planeMaterial);
        
        this.setupParticlePosition(particle, imagePlane, file, index);
    }

    createColoredParticle(file, index) {
        // Create particle for zoomed out view
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: this.getRandomParticleColor(),
            transparent: true,
            opacity: 0.8
        });

        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // Create colored plane for zoomed in view (fallback)
        const planeGeometry = new THREE.PlaneGeometry(2, 2);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: this.getRandomParticleColor(),
            transparent: true,
            opacity: 0.7
        });

        const imagePlane = new THREE.Mesh(planeGeometry, planeMaterial);
        
        this.setupParticlePosition(particle, imagePlane, file, index);
    }

    setupParticlePosition(particle, imagePlane, file, index) {
        // Position in orbit
        const angle = (index / this.files.length) * Math.PI * 2;
        const radius = this.config.orbitRadius.min + 
            Math.random() * (this.config.orbitRadius.max - this.config.orbitRadius.min);
        const height = (Math.random() - 0.5) * 10;

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

        // Initially show image planes, hide particles
        imagePlane.visible = true;
        particle.visible = false;
    }

    createBackgroundParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < this.config.particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            );

            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.2 + 0.5, 0.7, Math.random() * 0.5 + 0.5);
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.backgroundParticles = new THREE.Points(geometry, material);
        this.scene.add(this.backgroundParticles);
    }

    createNebula() {
        const geometry = new THREE.PlaneGeometry(50, 50);
        const material = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.1,
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

    updateBackgroundParticles() {
        if (this.backgroundParticles) {
            this.scene.remove(this.backgroundParticles);
        }
        this.createBackgroundParticles();
    }

    getRandomParticleColor() {
        const colors = [0x6366f1, 0x8b5cf6, 0x06d6a0, 0xf59e0b, 0xef4444];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            // Update orbital motion
            this.updateOrbitalMotion();

            // Update central sphere animation
            if (this.centralSphere && this.centralSphere.userData.animate) {
                this.centralSphere.userData.animate();
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
        this.imageParticles.forEach(data => {
            if (this.isZoomedOut) {
                // Spiral galaxy motion
                const time = Date.now() * 0.001;
                const spiralAngle = data.angle + time * data.speed;
                const spiralRadius = data.radius + Math.sin(time * 0.5) * 5;
                
                // Calculate spiral arm position
                const armIndex = Math.floor(data.angle / (Math.PI * 2 / this.config.spiralArms));
                const armAngle = spiralAngle + armIndex * (Math.PI * 2 / this.config.spiralArms);
                
                data.spiralPosition.x = Math.cos(armAngle) * spiralRadius;
                data.spiralPosition.z = Math.sin(armAngle) * spiralRadius;
                data.spiralPosition.y = data.height + Math.sin(time + data.angle) * 2;

                data.particle.position.copy(data.spiralPosition);
                data.imagePlane.position.copy(data.spiralPosition);
            } else {
                // Regular orbital motion
                data.angle += data.speed * this.config.rotationSpeed;
                const x = Math.cos(data.angle) * data.radius;
                const z = Math.sin(data.angle) * data.radius;
                
                data.particle.position.set(x, data.height, z);
                data.imagePlane.position.set(x, data.height, z);
                
                // Make image plane face camera
                data.imagePlane.lookAt(this.camera.position);
            }
        });
    }

    updateCameraPosition() {
        const targetZ = this.config.zoomLevel;
        
        new TWEEN.Tween(this.camera.position)
            .to({ z: targetZ }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    toggleZoomState() {
        this.isZoomedOut = !this.isZoomedOut;
        
        if (this.isZoomedOut) {
            this.zoomOut();
        } else {
            this.zoomIn();
        }
        
        this.updateCurrentView();
    }

    zoomOut() {
        // Animate camera to zoomed out position
        new TWEEN.Tween(this.camera.position)
            .to({ x: 50, y: 30, z: 80 }, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        // Switch to particle view
        this.imageParticles.forEach(data => {
            data.imagePlane.visible = false;
            data.particle.visible = true;
            
            // Add pulsing effect to particles
            const pulseAnimation = setInterval(() => {
                if (data.particle.visible) {
                    data.particle.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.3);
                } else {
                    clearInterval(pulseAnimation);
                }
            }, 50);
        });

        // Show constellations after delay
        setTimeout(() => {
            if (this.isZoomedOut) {
                this.createConstellations();
            }
        }, 1000);

        // Create particle burst from central sphere
        this.createParticleBurst();
    }

    zoomIn() {
        // Animate camera back to close position
        new TWEEN.Tween(this.camera.position)
            .to({ x: 0, y: 0, z: this.config.zoomLevel }, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        // Switch to image view
        this.imageParticles.forEach(data => {
            data.imagePlane.visible = true;
            data.particle.visible = false;
            data.particle.scale.setScalar(1);
        });

        // Hide constellations
        this.clearConstellations();
    }

    createConstellations() {
        if (!this.showConstellations) return;

        this.clearConstellations();

        // Create lines connecting nearby particles
        const positions = [];
        const colors = [];

        for (let i = 0; i < this.imageParticles.length; i++) {
            for (let j = i + 1; j < this.imageParticles.length; j++) {
                const particle1 = this.imageParticles[i];
                const particle2 = this.imageParticles[j];
                
                const distance = particle1.particle.position.distanceTo(particle2.particle.position);
                
                if (distance < 30 && Math.random() > 0.7) {
                    positions.push(
                        particle1.particle.position.x,
                        particle1.particle.position.y,
                        particle1.particle.position.z,
                        particle2.particle.position.x,
                        particle2.particle.position.y,
                        particle2.particle.position.z
                    );

                    const color = new THREE.Color(0x06d6a0);
                    colors.push(color.r, color.g, color.b);
                    colors.push(color.r, color.g, color.b);
                }
            }
        }

        if (positions.length > 0) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const material = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.3
            });

            const lines = new THREE.LineSegments(geometry, material);
            this.scene.add(lines);
            this.constellationLines.push(lines);

            // Animate constellation lines
            const animateLines = () => {
                if (this.constellationLines.includes(lines)) {
                    material.opacity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2;
                    requestAnimationFrame(animateLines);
                }
            };
            animateLines();
        }
    }

    clearConstellations() {
        this.constellationLines.forEach(line => {
            this.scene.remove(line);
        });
        this.constellationLines = [];
    }

    toggleConstellations() {
        this.showConstellations = !this.showConstellations;
        const btn = document.getElementById('toggleConstellations');
        btn.classList.toggle('active', this.showConstellations);
        
        if (this.isZoomedOut) {
            if (this.showConstellations) {
                this.createConstellations();
            } else {
                this.clearConstellations();
            }
        }
    }

    createParticleBurst() {
        const burstGeometry = new THREE.BufferGeometry();
        const burstPositions = [];
        const burstColors = [];

        for (let i = 0; i < 50; i++) {
            burstPositions.push(0, 0, 0); // Start at center
            
            const color = new THREE.Color();
            color.setHSL(Math.random(), 0.7, 0.6);
            burstColors.push(color.r, color.g, color.b);
        }

        burstGeometry.setAttribute('position', new THREE.Float32BufferAttribute(burstPositions, 3));
        burstGeometry.setAttribute('color', new THREE.Float32BufferAttribute(burstColors, 3));

        const burstMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            size: 2
        });

        const burstParticles = new THREE.Points(burstGeometry, burstMaterial);
        this.scene.add(burstParticles);

        // Animate burst
        const positions = burstGeometry.attributes.position.array;
        const startTime = Date.now();

        const animateBurst = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / 2000; // 2 second animation

            if (progress < 1) {
                for (let i = 0; i < positions.length; i += 3) {
                    const angle = (i / 3) * 0.5;
                    const distance = progress * 30;
                    
                    positions[i] = Math.cos(angle) * distance;
                    positions[i + 1] = (Math.random() - 0.5) * distance;
                    positions[i + 2] = Math.sin(angle) * distance;
                }

                burstGeometry.attributes.position.needsUpdate = true;
                burstMaterial.opacity = 0.8 * (1 - progress);
                
                requestAnimationFrame(animateBurst);
            } else {
                this.scene.remove(burstParticles);
            }
        };

        animateBurst();
    }

    onMouseMove(event) {
        this.lastMouseMove = Date.now();
        
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onTouchMove(event) {
        event.preventDefault();
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            this.lastMouseMove = Date.now();
        }
    }

    onTouchEnd() {
        // Trigger zoom on touch end
        this.toggleZoomState();
    }

    onMouseClick(event) {
        this.toggleZoomState();
    }

    checkAutoZoomOut() {
        if (!this.isZoomedOut && Date.now() - this.lastMouseMove > this.config.autoZoomTimeout) {
            this.toggleZoomState();
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
                this.showObjectInfo(object.userData.file);
                
                // Add hover effect
                object.scale.setScalar(1.2);
            }
        } else if (this.hoveredObject) {
            // Remove hover effect
            this.hoveredObject.scale.setScalar(1);
            this.hoveredObject = null;
            this.hideObjectInfo();
        }
    }

    showObjectInfo(file) {
        const infoContent = document.getElementById('infoContent');
        infoContent.innerHTML = `
            <p><span class="detail-label">Name:</span><span class="detail-value">${file.name}</span></p>
            <p><span class="detail-label">Size:</span><span class="detail-value">${this.formatFileSize(file.size)}</span></p>
            <p><span class="detail-label">Uploaded:</span><span class="detail-value">${this.formatDate(file.upload_date)}</span></p>
            ${file.dimensions ? `<p><span class="detail-label">Dimensions:</span><span class="detail-value">${file.dimensions.width}x${file.dimensions.height}</span></p>` : ''}
        `;
    }

    hideObjectInfo() {
        const infoContent = document.getElementById('infoContent');
        infoContent.innerHTML = '<p>Hover over an object to see details</p>';
    }

    resetView() {
        this.isZoomedOut = false;
        this.config.zoomLevel = 30;
        
        // Reset camera
        new TWEEN.Tween(this.camera.position)
            .to({ x: 0, y: 0, z: 30 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        // Reset particles view
        this.imageParticles.forEach(data => {
            data.imagePlane.visible = true;
            data.particle.visible = false;
            data.particle.scale.setScalar(1);
            data.imagePlane.scale.setScalar(1);
        });

        // Clear constellations
        this.clearConstellations();
        
        // Reset sliders
        document.getElementById('zoomSlider').value = 30;
        document.getElementById('speedSlider').value = 1;
        
        this.config.rotationSpeed = 1;
        this.updateCurrentView();
    }

    updateStats() {
        document.getElementById('objectCount').textContent = this.files.length;
        
        if (this.files.length > 0) {
            const oldestFile = this.files.reduce((oldest, file) => 
                new Date(file.upload_date) < new Date(oldest.upload_date) ? file : oldest
            );
            const galaxyAge = Math.floor((Date.now() - new Date(oldestFile.upload_date)) / (1000 * 60 * 60 * 24));
            document.getElementById('galaxyAge').textContent = `${galaxyAge} days`;
        }
    }

    updateCurrentView() {
        document.getElementById('currentView').textContent = this.isZoomedOut ? 'Galaxy View' : 'Close-up';
    }

    showShareModal() {
        const modal = document.getElementById('shareModal');
        const shareLink = `${window.location.origin}${window.location.pathname}?shared=true`;
        document.getElementById('shareLink').value = shareLink;
        modal.classList.add('show');
    }

    hideShareModal() {
        document.getElementById('shareModal').classList.remove('show');
    }

    copyShareLink() {
        const shareLink = document.getElementById('shareLink');
        shareLink.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('copyLinkBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }

    shareToplatform(platform) {
        const shareLink = document.getElementById('shareLink').value;
        const text = 'Check out my cosmic galaxy of memories!';
        
        let shareUrl = '';
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent('My Galaxy Repository')}&body=${encodeURIComponent(text + ' ' + shareLink)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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
            loadingScreen.classList.add('hidden');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 1000);
        }, 2000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up Three.js resources
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        this.renderer.dispose();
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
