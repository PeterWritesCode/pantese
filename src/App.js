import React, { useLayoutEffect, useRef, useState, useEffect, use } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useGSAP } from '@gsap/react';
import preloadImages from './preloadImages.js';
import { useAudio } from "./audioPlayer.js";
import { useImagePreload } from './useImagePreload.js';
import { useNavigate } from 'react-router-dom';
import { RemoveScrollBar } from 'react-remove-scroll-bar';
import getImages from './getImages.js';
import { preload } from 'react-dom';



gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function main() {
  const mainRef = useRef(null);
  const xrayFrame = getImages(require.context('./imagesTest/framesxray', true));
  const bgImages = getImages(require.context('./imagesTest/bgfg', true));
  const narizFrames = getImages(require.context('./imagesTest/frames', true));
  const betterFrames = getImages(require.context('./imagesTest/narizFrames', true));
  const intro = getImages(require.context('./imagesTest/page1/intro', true));
  const lenisRef = useRef(null);
  const rafIdRef = useRef(null);
  const [ready, setReady] = useState(false);

  
  const [visibleLoading, setVisibleLoading] = useState(true);
  const [loadingScreenIndex, setLoadingScreenIndex] = useState(1);
  const [readyScreen, setReadyScreen] = useState(false);
  let readyScreenRef = useRef(false);

  const [cancelled, setCancelled] = useState(false);
  const cancelledRef = useRef(false);
  const bgCancelledRef = useRef(false);
  let handleBg = useRef(null);
  let handleIntro = useRef(null);
  let handle = useRef(null);
  const preloadHandleRef = useRef(null);
  const [actuallyReady, setActuallyReady] = useState(false);
  const actuallyReadyRef = useRef(false);

  const blockRef = useRef({ up: true, down: true });
  let isScrollLocked = false;

  const { isPlaying, togglePlay } = useAudio();

  const cancel = () => {
  if (!cancelledRef.current) {
    cancelledRef.current = true;
    setCancelled(true); // triggers re-render -> removes {!cancelled && (...) } from html and also removes the ScrollTrigger timelines associated!
  }
};

  const [firstClick, setFirstClick] = useState(false);
  const [fading, setFading] = useState(false);
  let firstClickRef = useRef(false);

  const LoadingScreen = ({ readyScreen }) => {
    

    const handleClick = () => {
      if (!readyScreen) return;

      if (!firstClickRef.current) {
        if(!isPlaying){
          togglePlay();
        }
        
        blockRef.current.up = false;
        blockRef.current.down = false;
        setFading(true);
        firstClickRef.current = true;
      }
    };
    if (firstClick) return null;
    

    return (
      <div
        className="LoadingScreen"
        onClick={handleClick}
        style={{
          // full-screen overlay
          position: 'fixed',
          inset: 0,
          zIndex: 30,
          // fade
        }}
      >
      

      
      <>
        <img
          src={intro[1]}
          alt="Loading..."
          className="loadingScreen"
          onClick={handleClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 'auto',
            cursor: readyScreen ? 'pointer' : 'default',
          }}
        />
        {readyScreen && (
          <img
            src={intro[0]}
            alt="Loading..."
            className="loadingScreen"
            onClick={handleClick}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 'auto',
              cursor: readyScreen ? 'pointer' : 'default',
            }}
          />
        )}
      </>
    
      </div>
    );
  };

  useEffect(() => {
    if (!fading) return;

    const el = document.querySelector('.LoadingScreen');
    if (!el) return;

    gsap.to(el, {
      autoAlpha: 0,
      duration: 1,
      onComplete: () => setFirstClick(true)
    });

  }, [fading]);
  
  useEffect(() => {
      if(actuallyReadyRef.current) return;
  
      const preventScroll = (e) => {
        if (blockRef.current.up || blockRef.current.down) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };
      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
      window.addEventListener("keydown", preventScroll, { passive: false });
  
      return () => {
        window.removeEventListener("wheel", preventScroll);
        window.removeEventListener("touchmove", preventScroll);
        window.removeEventListener("keydown", preventScroll);
      };
  }, []);

  //Preload any images that need to be there before the user scrolls to them
  //If you don't, transitions might seem abrupt, bcs the images will be loading as you scroll and the browser will likely buffer and jitter
 
useEffect(() => {
  
  const imagesSet = Array.from(
    new Set([...xrayFrame, ...bgImages,  ...betterFrames])
  );

  (async () => {
    try {

      
      handleBg.current = await preloadImages([...narizFrames], {
        concurrency: 8,
        keepAlive: true,
        tolerateErrors: true,       // don't abort all on a single failure
        crossOrigin: "anonymous",   // if you draw to canvas; otherwise omit
        revokeBlobURLsOnRelease: false,
        label: "page 1",
      });
      if(bgCancelledRef.current) {
        handleBg.current?.release?.();
        return;
      }

      handle.current = await preloadImages(imagesSet, {
        concurrency: 8,
        keepAlive: true,
        tolerateErrors: true,       // don't abort all on a single failure
        crossOrigin: "anonymous",   // if you draw to canvas; otherwise omit
        revokeBlobURLsOnRelease: false,
        label: "page 1",
      });

      if (cancelledRef.current) {
        handle.current?.release?.();
        return;
      }

      preloadHandleRef.current = handle.current;
      setReady(true);
      console.log("loaded all images page 1");
    } catch (err) {
      if (!cancelledRef.current || !bgCancelledRef.current) {
        console.error("preloadImages failed", err);
        //Sets Ready anyway. So far, this has never happened, and it usually loads all images. If one of the images doesn't load it's very likely to be a single frame of an animation
        //which is not critical for the initial load
        setReady(true);
      }
    }
  })();

  return () => {
    cancel();
    preloadHandleRef.current?.release?.();
    preloadHandleRef.current = null;


    bgCancelledRef.current = true;
    handleBg.current?.release?.();
    handleBg.current = null;

  };
}, []);


  useLayoutEffect(() => {
  if (!ready || !mainRef.current) return;

  /// Lenis instance (gets initialized only after images are loaded)
  // because of the transitions from page to page, lenis and scrolltriggers need to be reset. They can only be started once page2 loads
  // otherwise it is very likely that the page will either exhibit strange behavior in the form of blinking, or freeze completely.
  // We only do it after preloading so the user can't scroll on an empty page
  lenisRef.current = new Lenis({
    duration: 3,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  let lastScrollY = 0;

  const raf = (time) => {
    if (!lenisRef.current) return;
    lenisRef.current.raf(time);
    ScrollTrigger.update();
    rafIdRef.current = requestAnimationFrame(raf);
  };

  
  const handleScroll = ({ scroll }) => {
    const { up, down } = blockRef.current;
    const delta = scroll - lastScrollY;
    const isUp = delta < 0;
    const isDown = delta > 0;

    if ((up && isUp) || (down && isDown)) {
      isScrollLocked = true;
      lenisRef.current.scrollTo(lastScrollY, { immediate: true });
      requestAnimationFrame(() => {
        isScrollLocked = false;
      });
    } else {
      lastScrollY = scroll;
    }
  };

  // Initialize
  lenisRef.current.scrollTo(0, { immediate: true });
  lenisRef.current.on("scroll", handleScroll);
  rafIdRef.current = requestAnimationFrame(raf);

  // Wait for DOM <img> elements in this page to fully load/decode,
  // then refresh ScrollTrigger so measurements include image sizes
  const scope = mainRef.current;
  const imgs = Array.from(scope.querySelectorAll("img"));
  const waitForDomImages = Promise.all(
    imgs.map((img) => {
      const settled =
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = img.onerror = () => res();
            });

      return settled.then(() =>
        typeof img.decode === "function" ? img.decode().catch(() => {}) : undefined
      );
    }),
    console.log("waited for images, done!")
  );
  console.log("going to try entering waitForDomImages");
  waitForDomImages.then(() => {
    console.log("Going to refresh ScrollTrigger and request a frame:");
    console.log("I am going to unblock scroll after that!");
    
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
      console.log("refreshed ScrollTrigger!");
      setTimeout(() => {
        console.log(readyScreenRef.current);
        setReadyScreen(true);
        
        console.log(readyScreenRef.current);
      }, 3000);
      
    });
    
    
  });

  return () => {

    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    ScrollTrigger.clearMatchMedia();


    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }


    if (lenisRef.current) {
      lenisRef.current.off("scroll", handleScroll);
      lenisRef.current.destroy();
      lenisRef.current = null;
    }

  };
}, [ready]);


  const navigate = useNavigate();
 
  useGSAP(() => {
    requestAnimationFrame(() => {
      console.log("refreshing scroll trigger at the beginning!");
      ScrollTrigger.refresh(true);
    });
  if (!ready) {return}; // Ensure images are loaded before running GSAP
  if(fading){
    console.log("Done!")
    gsap.to('.LoadingScreen', {autoAlpha: 0, duration: 1, onComplete: () => {
      console.log("Done!")
      setFirstClick(true);
    }});
  }
  console.log("removed the block!")

  const frames = gsap.utils.toArray('.narizFrame');
  const xrayFrames = gsap.utils.toArray('.xrayp12');
  const framesp4 = gsap.utils.toArray('.narizP4');
  const framesp6 = gsap.utils.toArray('.panteraP6');
  const framesp7 = gsap.utils.toArray('.panteraP7');
  const framesp8 = gsap.utils.toArray('.narizP8');
  const movep10 = gsap.utils.toArray('.narizP10');
  const framesEscada = gsap.utils.toArray('.panteraEscada');
  const narizTabuas = gsap.utils.toArray('.narizTabuas');

  gsap.set(frames, { autoAlpha: 0 }); // All invisible
  gsap.set(xrayFrames, { autoAlpha: 0 }); 
  gsap.set(framesp4, { autoAlpha: 0 }); 
  gsap.set(framesp7, { autoAlpha: 0 }); 
  gsap.set('.narizMartelo',{autoAlpha:0});   
  gsap.set(framesEscada,{autoAlpha:0});
  gsap.set(narizTabuas,{autoAlpha:0});
  

  const panel1n2 = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top top",
      end: "+=440%",
      scrub: true,
      pin: true,
      markers: false
    },
  });

  const stepDuration = 1; 
  const lengthFrames = frames.length - 1;

  frames.forEach((frame, index) => {
    // Become visible
      panel1n2.set(frame, { autoAlpha: 1 ,immediateRender: true }, index * stepDuration);
      if (index>=7 ){
        panel1n2.set(xrayFrames[index-7], { autoAlpha: 1 ,immediateRender: true }, index * stepDuration);
      }
    
    

    // become invisible
    if (index > 0) {
      if(index === lengthFrames){
      panel1n2.set(frames[index-1], { autoAlpha: 0  }, index * stepDuration);
      panel1n2.set(frames[index], { autoAlpha: 1 }, index * stepDuration *2);
    }
    else{
      panel1n2.set(frames[index - 1], { autoAlpha: 0 ,immediateRender: true }, index * stepDuration);
      if (index>=7 ){
      panel1n2.set(xrayFrames[index-8], { autoAlpha: 0 ,immediateRender: true }, index * stepDuration);
      }
    }
  }
  });
  
  gsap.set('.painel.tres', { opacity: 0, visibility: 'visible' });
  var panel3 = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=4%",
      end: "+=600%",
      scrub: true,
      pin: true,
      markers: false
    },
    }).to('.painel.tres', { autoAlpha: 0, duration: 10, immediateRender:false }) //hold before change


      .to('.painel.tres', { autoAlpha: 1, duration: 30, immediateRender:false}) //change


      .to({}, { duration: 4 }); //hold after change
  
  

  var panel4 = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=10%",
      end: "+=600%",
      scrub: true,
      pin: true,
      markers: false
    },
  });

  framesp4.forEach((frame, index) => {
    // Become visible
      panel4.set(frame, { autoAlpha: 1 , immediateRender:true }, index * stepDuration);
      
    // become invisible
    if (index > 0) {
      
      panel4.set(framesp4[index - 1], { autoAlpha: 0 , immediateRender:true }, index * stepDuration);
      
    
  }
  });

  panel4.set(framesp4[framesp4.length-1],{autoAlpha:0},framesp4.length*stepDuration);
  panel4.to({},{},framesp4.length+1*stepDuration);
  gsap.set('.panteraP5',{y:+300});
  var panel5omw = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=11%",
      end: "top+=17%",
      scrub: true,
      markers: false
    },
  }).to('.panteraP5',{y:-20,duration:10});
  
  var panel5ots = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=17%",
      end: "+=600%",
      scrub: true,
      pin: true,
      markers: false
    },
  });
 

  //Pantera Animations on Panel 5 (barrel turned towards us)

  
 

  var panel6 = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=21%",
      end: "+=1000%",
      scrub: true,
      pin: true,
      markers: false
    },
  }).to(framesp6[0], { autoAlpha: 1 , immediateRender:true}, 20)
    .to(framesp6[1], { autoAlpha: 1, immediateRender:true }, 40)
    .to(framesp6[2],{autoAlpha:1, immediateRender:true},60)
    .to(framesp6[2],{y:-680, duration:200, immediateRender:false}, 260)
    .to(framesp6[2],{autoAlpha:0, immediateRender:false},410)
    .to(framesp6[3],{autoAlpha:1,y:-680, immediateRender:false},410)
    .to(framesp6[3],{autoAlpha:0, immediateRender:false},560)
    .to(framesp6[2],{autoAlpha:1,y:-680, immediateRender:false},560)
    .to(framesp6[2],{autoAlpha:0, immediateRender:false},710)
    .to(framesp6[3],{autoAlpha:1,y:-680, immediateRender:false},710)
    .to({},{},960); 

    
    
    
    var panel7n8 = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=33%",
      end: "+=1500%",
      scrub: true,
      pin: true,
      markers: false
    },
  });
  
  const stepDurationOffset = stepDuration*2;
  framesp7.forEach((frame, index) => {
    if(index > 3){
      
    }
    else {
      // Become visible
      if(index === 2){
        panel7n8.set('.panteraP7bg', {autoAlpha: 1}, index * stepDurationOffset);
      }
        panel7n8.set(frame, { autoAlpha: 1 , immediateRender:true }, index * stepDurationOffset);
        
      // become invisible
      if (index > 0) {
        
        panel7n8.set(framesp7[index - 1], { autoAlpha: 0 , immediateRender:true }, index * stepDurationOffset);
        
      
      }
    }
    
  });

  panel7n8.to(framesp7[3], {y: 100, duration: 5});
  panel7n8.set(framesp7[3],{autoAlpha:0});
  panel7n8.set(framesp7[4],{autoAlpha:1});
  panel7n8.to(framesp7[4], {y: 150, duration: 5});
  const offset = framesp7.length * stepDurationOffset + 5;
  framesp8.forEach((frame, index) => {
    // Become visible
    
      panel7n8.set(frame, { autoAlpha: 1 , immediateRender:true }, index * stepDuration + offset);
      
    // become invisible
    if (index > 0) {
      console.log("inside first");
      if(index === framesp8.length-1){
        console.log("inside the if");
        panel7n8.set('.blueprintp8', {
          autoAlpha: 0,
          onComplete: () => console.log('blueprintp8 hidden')
        }, index * stepDuration + offset);
        panel7n8.set(framesp8[index-1], { autoAlpha: 0  }, index * stepDuration+ offset);
        panel7n8.set(framesp8[index], { autoAlpha: 1 }, index * stepDuration *2+ offset);
      }
      else{
        panel7n8.set(framesp8[index - 1], { autoAlpha: 0 ,immediateRender: false }, index * stepDuration+ offset);
      }
    }
    panel7n8.to({},{autoAlpha:0},10+ offset);
  
  });

  var panel9n10 = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo", 
      start: "top+=38%",
      end: "+=600%",
      scrub: true,
      pin: true,
      markers: false
    },
  }).to('.narizP9',{rotate:4, duration:0.1})
  .to('.narizP9',{rotate:-8, duration:0.2})
  .to('.narizP9',{rotate:2, duration:0.1})
  .to('.narizP9',{rotate:-6, duration:0.1})
  .to('.narizP9',{rotate:2, duration:0.1})
  .to('.narizP9',{rotate:-1, duration:0.1})
  .to('.narizP9',{rotate:8, duration:0.2})

  .to(movep10[1],{rotate:10, duration: 0.5})
  panel9n10.to(movep10[2],{x:-100, y: 20, rotate:190, duration: 0.5}, "<");

  var panel11 = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=40%",
      end: "top+=43%",
      pin: false,
      markers: false
    },
  });

  panel11.to('.panteraP11', {y: -240, duration: 2, ease: "none"});


  /* Because the jitter isn't (and can't be) scroll controlled, the only way I found that could make it happen was like this.
  The jitter isn't controled on the timeline itself and instead is a general gsap .to command.  */
  gsap.to('.panteraP11', {
    x: () => gsap.utils.random(-10, 10),
    rotate: () => gsap.utils.random(-5, 5),
    duration: 0.04,
    repeat: -1,
    yoyo: true,
    ease: "none"
  });

   /* Because of the reasons explained above, I really couldn't figure out how to make panel12 animate after panel11 in the same timeline
   Every way I tried broke the animations of both panels, so I separated them and had P11 be independent

   Because of that I had to do scrub false, which makes it so the animation only happens once, UP, so the panther never goes down again into the 
   barrel if we scroll down. */
  var panel12 = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=43%",
      end: "+=200%",
      scrub: true,
      pin: true,
      markers: false
    },
  });

  panel12.to('.panteraP12olhos', {
    x: 10,
    duration: 200,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  },">");

  var panteraEscada = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=49.4%",
      end: "+=880%",
      scrub: true,
      pin: true,
      markers: false
    },
  }).set('.narizMartelo',{autoAlpha:0},0);

  
  framesEscada.forEach((frame, index) => {
   
      // Become visible
      if(index === 17){
        panteraEscada.set('.bgEscada', {autoAlpha: 0}, index * stepDurationOffset);
      }
        panteraEscada.set(frame, { autoAlpha: 1 , immediateRender:true }, index * stepDurationOffset);
        
      // become invisible
      if (index > 0) {
        
        panteraEscada.set(framesEscada[index - 1], { autoAlpha: 0 , immediateRender:true }, index * stepDurationOffset);
        
      
      }
    
    
  });
  var narizCai = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=50.4%",
      end: "+=880%",
      pin: true,
      markers: false,
      onEnter: () => { 
        blockRef.current.up = true;
        console.log("Scroll Up Blocked Nariz Cai");
        panel1n2.kill();
        panel3.kill();
        panel4.kill();
        panel5omw.kill();
        panel5ots.kill();
        panel6.kill();
        panel7n8.kill();
        panel9n10.kill();
        panel11.kill();
        panel12.kill();
      },
      onLeave: () => {document.body.style.overflow = '';blockRef.current.down = false;console.log("Scroll Down unblocked Nariz Cai") },
    },
  }).call(()=> {
    blockRef.current.down = true;
    console.log("Scroll Down Blocked Nariz Cai");
  }, null, 0);

  narizCai.set('.narizPCai', {css: {zIndex: 3}}, 2.5)
  .set('.narizCaiPainel', {css: {zIndex: 3}}, "<")
  .to('.narizPCai', {y: 2300, duration: 1}, "<")
  .to('.narizCaiPainel', {y: 2200, duration: 0.9}, "<")

  // narizPCai sway (10 steps over 1s, starts at 2.5)
  .to('.narizPCai', {x: 6, duration: 0.1}, 2.5)
  .to('.narizPCai', {x: -9, duration: 0.1}, 2.6)
  .to('.narizPCai', {x: 7, duration: 0.1}, 2.7)
  .to('.narizPCai', {x: -5, duration: 0.1}, 2.8)
  .to('.narizPCai', {x: 4, duration: 0.1}, 2.9)
  .to('.narizPCai', {x: -6, duration: 0.1}, 3.0)
  .to('.narizPCai', {x: 3, duration: 0.1}, 3.1)
  .to('.narizPCai', {x: -2, duration: 0.1}, 3.2)
  .to('.narizPCai', {x: 1, duration: 0.1}, 3.3)
  .to('.narizPCai', {x: 0, duration: 0.1}, 3.4)

  // narizCaiPainel sway (10 steps over 0.9s, step = 0.09s)
.to('.narizCaiPainel', {x: 5, duration: 0.09}, 2.5)
.to('.narizCaiPainel', {x: -8, duration: 0.09}, 2.59)
.to('.narizCaiPainel', {x: 6, duration: 0.09}, 2.68)
.to('.narizCaiPainel', {x: -4, duration: 0.09}, 2.77)
.to('.narizCaiPainel', {x: 3, duration: 0.09}, 2.86)
.to('.narizCaiPainel', {x: -6, duration: 0.09}, 2.95)
.to('.narizCaiPainel', {x: 2, duration: 0.09}, 3.04)
.to('.narizCaiPainel', {x: -1, duration: 0.09}, 3.13)
.to('.narizCaiPainel', {x: 0.5, duration: 0.09}, 3.22)
.to('.narizCaiPainel', {x: 0, duration: 0.09}, 3.31)

  .set('.narizPCai', {autoAlpha:0 }, 3.5)
  .set('.narizCaiPainel', {autoAlpha:0}, 3.31)
  
  .set('.narizPCaido',{css: {zIndex: 4}},3.5)
  .set('.narizPainelEstragado',{css: {zIndex: 3}},3.31)
  .set('.narizPCaido',{y:2100, autoAlpha:1, duration:0},3.5)
  .set('.narizPainelEstragado',{y:2200, autoAlpha:1, duration:0},3.31);

  narizCai.eventCallback("onComplete", () => {
    document.body.style.overflow = '';
    blockRef.current.down = false;
    console.log("Scroll enabled after narizCai");
  });

   var narizTLMartelo = gsap.timeline({
    scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=62.4%",
      end: "+=600%",
      pin: true,
      markers: false,
      onEnter: () => { blockRef.current.up = true;console.log("Scroll Up Blocked narizTLMartelo") },
      onLeave: () => {document.body.style.overflow = '';blockRef.current.down = false; console.log("Scroll Down unblocked narizTLMartelo") },
      onLeaveBack: () => {document.body.style.overflow = '';blockRef.current.down = false; console.log("Scroll Down Unblocked narizTlMartelo2") }, // optional
    },
  }).call(()=> {
    blockRef.current.down = true;
    console.log("Scroll Down Blocked narizTLMartelo");
  }, null, 0);
  
  narizTLMartelo.set('.narizMartelo',{autoAlpha:1 })
  .to('.narizMartelo',{y:1860, duration:0.5},0.1)
  .set('.narizMartelo',{autoAlpha:0,
    onComplete: () => { 
    console.log("cancelled = true and handles released!");
    cancel();
    preloadHandleRef.current?.release?.();
    preloadHandleRef.current = null;
  }},0.6)
  //.set('.narizImpacto',{y:2200, autoAlpha:1},0.6)
  .set('.narizPCaido', {autoAlpha:0},0.7)
  .set('.narizBlackout',{y:2200, autoAlpha:1},">")
  .set('.background',{autoAlpha:0},">")
  .set('.narizTabuas', { autoAlpha: 1 }, ">")

  // Animate fall of each .narizTabuas
  .to(narizTabuas[0], {
    y: 2200,
    duration: 0.6,
    ease: 'power2.in',
  }, ">")

  .to(narizTabuas[1], {
    y: 2200,
    duration: 0.4,
    ease: 'power2.in',
  }, ">0.1")

  .to([narizTabuas[2], narizTabuas[3]], {
    y: 2200,
    duration: 0.7,
    ease: 'power2.in',
  }, ">0.05")

  .to([narizTabuas[4],narizTabuas[7] ] , {
    y: 2200,
    duration: 0.5,
    ease: 'power2.in',
  }, ">0.06")
  
  .to([ narizTabuas[6], narizTabuas[5]],{
    y: 2200,
    duration: 0.8,
    ease: 'power2.in',
  }, ">0.03")
  .set(narizTabuas[0],{css: {backgroundColor:'black'}},">")
  .set(narizTabuas[8],{autoAlpha:1,y:2200},">2")
  .set({},{autoAlpha:0,duration:2},">2");

  narizTLMartelo.eventCallback("onComplete", () => {
    document.body.style.overflow = '';
    blockRef.current.down = false;
    
    console.log("Scroll enabled after narizTLMartelo");
  });
var navigateNext = gsap.timeline({
  scrollTrigger: {
    trigger: "#svgfundo",
    start: "top+=67.4%",
    end: "+=880%",
    pin: true,
    markers: false,
    onEnter: () => {
      requestAnimationFrame(() => navigate('/page2'));
    },
  },
});
}, { scope: mainRef, dependencies: [ready] });

  return (
    
    <section  ref={mainRef} style={{justifyContent:'stretch', display: 'flex', position: 'relative', top: '0', left: '0',overflowY:'hidden !important'}}>
      <RemoveScrollBar/>
      <div id="svgfundo" style={{backgroundColor:'black', display: 'block', width: '100%',overflowX:'hidden'}}>
        <LoadingScreen readyScreen={readyScreen}/>
        <img src={bgImages[0]} className="background"  style={{ position:'relative', top:'0', left:'0',width: '100%', minHeight:'100vh', height: 'auto' , zIndex: '-1'}} /> {/* blue background */}
        <img src={bgImages[3]} style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto', zIndex: '5'}} /> {/* panels */}
        <img src={bgImages[1]} style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto', zIndex: '2'}} /> {/* objects */}
        <img src={bgImages[2]} className="bgEscada" style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto', zIndex: '6'}} /> {/* ladder */}
        <img src={bgImages[4]} style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto', zIndex: '7'}} /> {/* barrel */}
        <img src={bgImages[7]} style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto', zIndex: '4'}} /> {/* smaller barrel panel 7 */}    
        {!cancelled && (
          <>
            {/* Outside of the panel */}
            {/* Place images/components here that should only show when !cancelled is true */}
          
        <img className="narizFrame" src={betterFrames[0]} style={{ position:'absolute', top:'0.45%', left: '-30%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        {/* Inside! */}
        <img className="narizFrame" src={betterFrames[1]} style={{ position:'absolute', top:'0.45%', left: '10%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizFrame" src={betterFrames[2]} style={{ position:'absolute', top:'0.45%', left: '14%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizFrame" src={betterFrames[3]} style={{ position:'absolute', top:'0.45%', left: '17%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizFrame" src={betterFrames[4]} style={{ position:'absolute', top:'0.45%', left: '21%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizFrame" src={betterFrames[5]} style={{ position:'absolute', top:'0.45%', left: '25%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizFrame" src={betterFrames[6]} style={{ position:'absolute', top:'0.45%', left: '29%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
         {/* gutter panels 1-2! */}
        <img className="narizFrame" src={betterFrames[7]} style={{ position:'absolute', top:'0.45%', left: '33%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="xrayp12" src={xrayFrame[0]} style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto', zIndex: '6', loading:"eager"}} />
        <img className="narizFrame" src={betterFrames[0]} style={{ position:'absolute', top:'0.45%', left: '37%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="xrayp12" src={xrayFrame[1]} style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto', zIndex: '6', loading:"eager"}} />
        <img className="narizFrame" src={betterFrames[1]} style={{ position:'absolute', top:'0.45%', left: '41%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="xrayp12" src={xrayFrame[2]} style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto', zIndex: '6', loading:"eager"}} />
        <img className="narizFrame" src={betterFrames[2]} style={{ position:'absolute', top:'0.45%', left: '45%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="xrayp12" src={xrayFrame[3]} style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto', zIndex: '6', loading:"eager"}} />
        <img className="narizFrame" src={betterFrames[3]} style={{ position:'absolute', top:'0.45%', left: '49%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="xrayp12" src={xrayFrame[4]} style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto', zIndex: '6', loading:"eager"}} />
        {/* out of the gutter */}
        <img className="narizFrame" src={betterFrames[4]} style={{ position:'absolute', top:'0.45%', left: '53%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizFrame" src={narizFrames[1]} style={{ position:'absolute', top:'0.45%', left: '57%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        {/* panel 3 */}
        <img className="narizP3" src={narizFrames[2]} style={{ position:'absolute', top:'6%', left: '58%', width:'23%', height: 'auto', zIndex:'1'}}/>
        <img className="painel tres" src={bgImages[5]} style={{ position:'absolute', top:'0', left: '0', width:'100%', height: 'auto', maxHeight: '100%', zIndex:'3', opacity:0, visibility:'visible'}}/>
        {/* panel 4 */}
        <img className="narizP4" src={narizFrames[3]} style={{ position:'absolute', top:'12%', left: '40%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP4" src={narizFrames[3]} style={{ position:'absolute', top:'12%', left: '48%', width:'23%', height: 'auto', zIndex:'1', transform:'scaleX(-1)',  opacity:0, visibility:'visible'}}/>
        <img className="narizP4" src={narizFrames[1]} style={{ position:'absolute', top:'12%', left: '52%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP4" src={narizFrames[0]} style={{ position:'absolute', top:'12%', left: '55%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP4" src={narizFrames[0]} style={{ position:'absolute', top:'12%', left: '59%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP4" src={narizFrames[0]} style={{ position:'absolute', top:'12%', left: '63%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP4" src={narizFrames[0]} style={{ position:'absolute', top:'12%', left: '67%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/> 
        <img className="narizP4" src={narizFrames[0]} style={{ position:'absolute', top:'12%', left: '71%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/> 
        <img className="narizP4" src={narizFrames[0]} style={{ position:'absolute', top:'12%', left: '75%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/> 
        <img className="narizP4" src={narizFrames[0]} style={{ position:'absolute', top:'12%', left: '79%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/> 
        
        {/* panel 5 - barrel */}
        <img className="panteraP5" src={narizFrames[4]} style={{ position:'absolute', top:'17%', left: '20%', width:'60%', height: 'auto', zIndex:'3 ' }}/>  
        
        {/* panel 6 - panther peeks */}
        <img className="panteraP6" src={narizFrames[5]} style={{ position:'absolute', top:'23.4%', left: '20%', width:'60%', height: 'auto', zIndex:'8 ',  opacity:0, visibility:'visible' }}/>  
        <img className="panteraP6" src={narizFrames[6]} style={{ position:'absolute', top:'23.4%', left: '20%', width:'60%', height: 'auto', zIndex:'8 ',  opacity:0, visibility:'visible' }}/>
        <img className="panteraP6" src={narizFrames[7]} style={{ position:'absolute', top:'29%', left: '20%', width:'60%', height: 'auto', zIndex:'6 ',  opacity:0, visibility:'visible' }}/>    
        <img className="panteraP6" src={narizFrames[7]} style={{ position:'absolute', top:'29%', left: '20%', width:'60%', height: 'auto', zIndex:'6 ', transform:'scaleX(-1)',  opacity:0, visibility:'visible' }}/>    
        
        {/* panel 7 - panther switches house guidelines */}
        <img className="panteraP7" src={narizFrames[8]} style={{ position:'absolute', top:'35.5%', left: '13%', width:'35%', height: 'auto', zIndex:'3 ',  opacity:0, visibility:'visible' }}/>  
        <img className="panteraP7" src={narizFrames[9]} style={{ position:'absolute', top:'35.5%', left: '13%', width:'35%', height: 'auto', zIndex:'3 ',  opacity:0, visibility:'visible' }}/>  

        {/* bg change panel 7 */}  
        <img className="panteraP7bg" src={bgImages[6]} style={{ position:'absolute', top:'0', left: '0', width:'100%', height: 'auto', zIndex:'7 ',  opacity:0, visibility:'visible' }}/>
        <img className="panteraP7" src={narizFrames[10]} style={{ position:'absolute', top:'35.5%', left: '13%', width:'35%', height: 'auto', zIndex:'3 ',  opacity:0, visibility:'visible' }}/>          
        <img className="panteraP7" src={narizFrames[11]} style={{ position:'absolute', top:'35.5%', left: '13%', width:'35%', height: 'auto', zIndex:'2 ',  opacity:0, visibility:'visible' }}/>
        <img className="panteraP7" src={narizFrames[12]} style={{ position:'absolute', top:'35.6%', left: '13%', width:'35%', height: 'auto', zIndex:'2 ',  opacity:0, visibility:'visible' }}/>
        
        {/* panel 8 - same timeline as panel 7 */}
        <img className="narizP8" src={narizFrames[3]} style={{ position:'absolute', top:'35.5%', right: '-15%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP8" src={narizFrames[3]} style={{ position:'absolute', top:'35.5%', right: '-10%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP8" src={narizFrames[3]} style={{ position:'absolute', top:'35.5%', right: '-6%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP8" src={narizFrames[3]} style={{ position:'absolute', top:'35.5%', right: '-2%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP8" src={narizFrames[3]} style={{ position:'absolute', top:'35.5%', right: '2%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP8" src={narizFrames[3]} style={{ position:'absolute', top:'35.5%', right: '6%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP8" src={narizFrames[3]} style={{ position:'absolute', top:'35.5%', right: '10%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP8" src={narizFrames[3]} style={{ position:'absolute', top:'35.5%', right: '14%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP8" src={narizFrames[3]} style={{ position:'absolute', top:'35.5%', right: '18%', width:'23%', height: 'auto', zIndex:'1',  opacity:0, visibility:'visible'}}/>
        <img className="narizP8" src={narizFrames[13]} style={{ position:'absolute', top:'35.5%', right: '18%', width:'23%', height: 'auto', zIndex:'3',  opacity:0, visibility:'visible'}}/>
        
        {/* panel 9 - hand crushing paper*/ }
        <img className="narizP9" src={narizFrames[14]} style={{ position:'absolute', top:'39.5%', left: '20%', width:'31%', height: 'auto', zIndex:'3', visibility:'visible'}}/>
        
        {/* panel 10 - nariz throwing paper*/ }
        <img className="narizP10" src={narizFrames[15]} style={{ position:'absolute', top:'39.7%', left: '64%', width:'16%', height: 'auto', zIndex:'3', visibility:'visible'}}/>
        <img className="narizP10" src={narizFrames[16]} style={{ position:'absolute', top:'42%', left: '67.2%', width:'8%', height: 'auto', zIndex:'2', visibility:'visible', transformOrigin:'top right', transform:'rotate(30deg)'}}/>
        <img className="narizP10" src={bgImages[9]} style={{ position:'absolute', top:'41%', left: '62%', width:'6%', height: 'auto', zIndex:'3', visibility:'visible', transformOrigin:'center center'}}/>
 
        {/* panel 11 -12 Pantera coming up and scanning paper*/ }
        <img className="panteraP11" src={narizFrames[17]} style={{ position:'absolute', top:'47%', left: '25.1%', width:'20%', height: 'auto', zIndex:'3', visibility:'visible'}}/>
    
        <img className="panteraP12" src={narizFrames[18]} style={{ position:'absolute', top:'44.6%', left: '56%', width:'20%', height: 'auto', zIndex:'8', visibility:'visible'}}/>
        <img className="panteraP12olhos" src={narizFrames[19]} style={{ position:'absolute', top:'44.6%', left: '56%', width:'20%', height: 'auto', zIndex:'7', visibility:'visible'}}/>
        {/* Pantera Escada */}
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '-35%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '-31%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '-27%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '-23%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '-19%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '-15%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '-10%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '-5%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '0%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '5%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '10%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '15%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '20%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '25%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '30%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '35%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[20]} style={{ position:'absolute', top:'49.4%', left: '40%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '40%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '45%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '50%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '55%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '60%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '65%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '70%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '75%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '80%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '85%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '90%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '95%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '100%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>
        <img className="panteraEscada" src={narizFrames[21]} style={{ position:'absolute', top:'49.4%', left: '105%', width:'50%', height: 'auto', zIndex:'7',  opacity:0, visibility:'visible', transform:'ScaleX(-1)'}}/>


        <img className="narizPCai" src={narizFrames[22]} style={{ position:'absolute', top:'40.4%', left: '10%', width:'80%', height: 'auto', zIndex:'-3', visibility:'visible'}}/>
</>
)}
        <img className="narizCaiPainel" src={bgImages[10]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'-3', visibility:'visible'}}/>
        <img className="narizPCaido" src={narizFrames[23]} style={{ position:'absolute', top:'40.4%', left: '10%', width:'80%', height: 'auto', zIndex:'-3', visibility:'visible'}}></img>
        <img className="narizPainelEstragado" src={bgImages[12]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'-3', visibility:'visible'}}/>
        <img className="narizMartelo" src={narizFrames[24]} style={{ position:'absolute', top:'49.4%', left: '27.1%', width:'6%', height: 'auto', zIndex:'3',  opacity:0, visibility:'visible'}}/>
        <img className="narizImpacto" src={bgImages[13]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'3',  opacity:0, visibility:'visible'}}/>
        <img className="narizBlackout" src={narizFrames[25]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'3',  opacity:0, visibility:'visible'}}/>
            
        <img className="narizTabuas" src={narizFrames[26]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'3',  opacity:0, visibility:'visible'}}/>
        <img className="narizTabuas" src={narizFrames[27]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'4',  opacity:0, visibility:'visible'}}/>
        <img className="narizTabuas" src={narizFrames[28]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'4',  opacity:0, visibility:'visible'}}/>
        <img className="narizTabuas" src={narizFrames[29]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'4',  opacity:0, visibility:'visible'}}/>
        <img className="narizTabuas" src={narizFrames[30]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'4',  opacity:0, visibility:'visible'}}/>
        <img className="narizTabuas" src={narizFrames[31]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'4',  opacity:0, visibility:'visible'}}/>
        <img className="narizTabuas" src={narizFrames[32]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'4',  opacity:0, visibility:'visible'}}/>
        <img className="narizTabuas" src={narizFrames[33]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'4',  opacity:0, visibility:'visible'}}/>

        <img className="narizTabuas" src={narizFrames[34]} style={{ position:'absolute', top:'38.5%', left: '10%', width:'80%', height: 'auto', zIndex:'3',  opacity:0, visibility:'visible'}}/>
      
      </div>
    </section>

    
  );
}
