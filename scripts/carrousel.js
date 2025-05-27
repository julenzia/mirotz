console.log('carousel.js script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    setTimeout(() => {
        const track = document.querySelector('.carousel-track');
        const container = document.querySelector('.carousel-container');
        const items = document.querySelectorAll('.carousel-item');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const lyricsToggles = document.querySelectorAll('.lyrics-toggle');

        console.log('Carousel track:', track);
        console.log('Carousel container:', container);
        console.log('Carousel container width:', container ? container.getBoundingClientRect().width : 'N/A');
        console.log('Carousel track width:', track ? track.getBoundingClientRect().width : 'N/A');
        console.log('Carousel items count:', items.length);
        console.log('Carousel prevBtn:', prevBtn);
        console.log('Carousel nextBtn:', nextBtn);
        console.log('Carousel lyricsToggles count:', lyricsToggles.length);

        if (!track || !container || items.length === 0) {
            console.error('Carousel elements missing, aborting carousel setup.');
            return;
        }

        let currentIndex = 0;
        let containerWidth = container.getBoundingClientRect().width;

        function setItemWidth() {
            containerWidth = container.getBoundingClientRect().width;
            items.forEach((item) => {
                item.style.minWidth = `${containerWidth}px`;
            });
        }

        setItemWidth();

        window.addEventListener('resize', () => {
            setItemWidth();
            try {
                if (track) {
                    track.style.transform = `translateX(-${currentIndex * containerWidth}px)`;
                }
            } catch (error) {
                console.error('Error setting track style on resize:', error);
            }
        });

        function moveToIndex(index) {
            if (index < 0) index = items.length - 1;
            if (index >= items.length) index = 0;

            currentIndex = index;
            try {
                if (track) {
                    track.style.transition = 'transform 0.5s ease';
                    track.style.transform = `translateX(-${currentIndex * containerWidth}px)`;
                }
            } catch (error) {
                console.error('Error setting track style in moveToIndex:', error);
            }

            items.forEach((item, idx) => {
                const video = item.querySelector('video');
                if (video) {
                    if (idx === currentIndex) {
                        video.currentTime = 0;
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                    }
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                moveToIndex(currentIndex - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                moveToIndex(currentIndex + 1);
            });
        }

        lyricsToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const lyricsContainer = this.nextElementSibling;
                if (lyricsContainer) {
                    lyricsContainer.classList.toggle('show');
                    this.textContent = lyricsContainer.classList.contains('show') ? 'Itxi' : 'Hitzak';
                }
            });
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                moveToIndex(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                moveToIndex(currentIndex + 1);
            }
        });

        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });

        track.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const minSwipeDistance = 50;
            if (touchStartX - touchEndX > minSwipeDistance) {
                moveToIndex(currentIndex + 1);
            } else if (touchEndX - touchStartX > minSwipeDistance) {
                moveToIndex(currentIndex - 1);
            }
        }

        moveToIndex(0);

        function setupVideoControls() {
            const videos = document.querySelectorAll('.carousel-item video');
            const audioMap = {
                'URTARRILANMOTZA.mp4': 'medioak/abestiak/urtarrilan.mp3',
                'ILUNSENTIARIMOTZA.mp4': 'medioak/abestiak/ilunsentiari.mp3',
                'OIHUBATMOTZA.mp4': 'medioak/abestiak/oihubat.mp3',
                'ZURETZATMOTZA.mp4': 'medioak/abestiak/zuretzat.mp3',
                'AMILDEGIANMOTZA.mp4': 'medioak/abestiak/amildegian.mp3'
            };
            const audioObjects = {};
            let currentAudio = null;

            videos.forEach(video => {
                video.style.cursor = 'pointer';
                video.addEventListener('click', function() {
                    const videoSrc = video.src.split('/').pop();
                    const audioSrc = audioMap[videoSrc];
                    if (audioSrc) {
                        if (!audioObjects[audioSrc]) {
                            audioObjects[audioSrc] = new Audio(audioSrc);
                        }
                        const audio = audioObjects[audioSrc];
                        if (currentAudio && currentAudio !== audio && !currentAudio.paused) {
                            currentAudio.pause();
                        }
                        if (audio.paused) {
                            audio.play().catch(() => {});
                            currentAudio = audio;
                        } else {
                            audio.pause();
                        }
                    }
                });
            });
        }

        setupVideoControls();
    }, 100);
});
