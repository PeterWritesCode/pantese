import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useGSAP } from '@gsap/react';
import { useNavigate } from 'react-router-dom';
import getWindowSize from './windowSize.js';
import preloadImages from './preloadImages.js';
import getImages from './getImages.js';
import { RemoveScrollBar } from 'react-remove-scroll-bar';
import bgImage1 from './imagesTest/page2/bgfg/a0bg.webp';
import './page2.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Import images

let bgImages = getImages(require.context('./imagesTest/page2/bgfg', true));
let cortePainel= getImages(require.context('./imagesTest/page2/cortepainel', true));
let narizImages = getImages(require.context('./imagesTest/page2/frames/narizFrames', true));
let panteraImages = getImages(require.context('./imagesTest/page2/frames/panteraFrames', true));
let narizCommon = getImages(require.context('./imagesTest/common/narizFrames', true));
let panteraCommon = getImages(require.context('./imagesTest/common/panteraFrames', true));
let lastPanel = getImages(require.context('./imagesTest/page2/lastpanel', true));

// Scroll control flags

let panel3fallFired = false;
let panel3panteraFired = false;
let panel6fallFired = false;
let panel10cimentoFired = false;
// Lenis instance (we’ll initialize it only after images are loaded)


export default function Page2() {
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const windowSize = getWindowSize();
  const lenisRef = useRef(null);
  const rafIdRef = useRef(null);
  const blockRef = useRef({ up: true, down: true });
  const preloadHandleRef = useRef(null);
  const isScrollLockedRef = useRef(false)

  const [cancelled, setCancelled] = useState(false);
  const [corteCancelled, setCorteCancelled] = useState(false);
  const [panel11Cancelled, setPanel11Cancelled] = useState(false);
  const [commonCancelled, setCommonCancelled] = useState(false);
  const [actuallyReady, setActuallyReady] = useState(false);
  const actuallyReadyRef = useRef(false);

  const cancelledRef = useRef(false);
  let bgPreloadHandleRef = useRef(null);
  let bgCancelledRef = useRef(false);

  let commonHandleRef = useRef(null);
  let corteHandleRef = useRef(null);
  let bgHandleRef = useRef(null);
  let handleRef = useRef(null);
  let panel11HandleRef = useRef(null);
  
  const cancel = () => {
    if (!cancelledRef.current) {
      cancelledRef.current = true;
      setCancelled(true); // triggers re-render -> removes {!cancelled && (...) } block
    }
  };
  const cancelCorte = () => {
    if (!corteCancelled.current) {
      setCorteCancelled(true);
    }
  };
  const cancelPanel11 = () => {
    if (!panel11Cancelled.current) {
      setPanel11Cancelled(true);
    }
  };
  const cancelCommon = () => {
    if (!commonCancelled.current) {
      setCommonCancelled(true);
    }
  };

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

  // Preload images before initializing everything
   useEffect(() => {
    
    // Gather and dedupe URLs
    const urls = Array.from(
      new Set([...narizImages, ...panteraImages, ...cortePainel])
    );

   (async () => {

       try {
        bgHandleRef.current = await preloadImages([...bgImages], {
          concurrency: 8,
          keepAlive: true,
          tolerateErrors: true,       // don't abort all on a single failure
          crossOrigin: "anonymous",   // if you draw to canvas; otherwise omit
          revokeBlobURLsOnRelease: false,
        });
        if(bgCancelledRef.current) {
          bgHandleRef.current?.release?.();
          return;
        }
        bgPreloadHandleRef.current = bgHandleRef.current;
        handleRef.current = await preloadImages(urls, {
           concurrency: 8,
           keepAlive: true,
           tolerateErrors: true,       // don't abort all on a single failure
           crossOrigin: "anonymous",   // if you draw to canvas; otherwise omit
           revokeBlobURLsOnRelease: false,
           label: "page 2",
         });
         if (cancelledRef.current) {
           handleRef.current?.release?.();
           return;
         }
         preloadHandleRef.current = handleRef.current;
         setReady(true);
         console.log("loaded all images page 2");
       } catch (err) {
         if (!cancelledRef.current || !bgCancelledRef.current) {
           console.error("preloadImages failed", err);
           // proceed anyway if you prefer
           setReady(true);
         }
       }
     })();

     return () => {
       cancel();
       preloadHandleRef.current?.release?.();
       preloadHandleRef.current = null;
       
       bgCancelledRef.current = true;
       bgHandleRef.current?.release?.();
       bgHandleRef.current = null;
     };

   }, []);
    
  // because of the transition from App.js to page2.js we need to reset lenis and scrolltrigger, and start both of them once page2 loads. 
  // We only do it after preloading so the user can't scroll on an empty page 
  useLayoutEffect(() => {
  if (!ready || !mainRef.current) return;

  // Set up Lenis
  lenisRef.current = new Lenis({
    duration: 3,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  let lastScrollY = 0;
  let isScrollLocked = false;

  const raf = (time) => {
    if (!lenisRef.current) return;
    lenisRef.current.raf(time);
    ScrollTrigger.update();
    rafIdRef.current = requestAnimationFrame(raf);
  };

  const handleScroll = ({ scroll }) => {
    if(actuallyReadyRef.current) return;
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
  // then refresh ScrollTrigger so measurements include intrinsic sizes.
  const scope = mainRef.current;
  const imgs = Array.from(scope.querySelectorAll("img"));
  const waitForDomImages = Promise.all(
    imgs.map((img) => {
      // First wait for load/error event if not complete
      const settled =
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = img.onerror = () => res();
            });

      // Then try decode() for proper layout-ready bitmaps
      return settled.then(() =>
        typeof img.decode === "function" ? img.decode().catch(() => {}) : undefined
      );
    }),
    console.log("waited for images, done!")
  );
  console.log("going to try entering waitForDomImages");
  waitForDomImages.then(() => {
    // Give the browser a paint, then refresh
    console.log("Going to refresh ScrollTrigger and request a frame:");
    console.log("I am going to unblock scroll after that!");
    
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
      console.log("refreshed ScrollTrigger!");
      
      setTimeout(() => {
        console.log("Timeout of 3 seconds reached after unblocking scroll");
        blockRef.current.up = false;
        blockRef.current.down = false;
      }, 3000);
      console.log("unblocked scroll");
    });
    
    
  });

  return () => {
    // Kill all ScrollTriggers for this page
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    ScrollTrigger.clearMatchMedia();

    // Cancel RAF loop
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Destroy Lenis
    if (lenisRef.current) {
      lenisRef.current.off("scroll", handleScroll);
      lenisRef.current.destroy();
      lenisRef.current = null;
    }

    // Do NOT release images here (useEffect cleanup already does it)
  };
}, [ready]);

    useGSAP(() => {
    console.log("not ready to start GSAP yet!")
    requestAnimationFrame(() => {
      console.log("refreshing scroll trigger at the beginning!");
    ScrollTrigger.refresh(true);
  });
    if (!ready) {return}; // Ensure images are loaded before running GSAP
    console.log("removed the block!")
    
    const paineis = gsap.utils.toArray('.paineis');
    const p2F = gsap.utils.toArray('.panel2Full');
    const p2LDC = gsap.utils.toArray('.panel2LDC');
    const p2LUC = gsap.utils.toArray('.panel2LUC');
    const p2LEmpty = gsap.utils.toArray('.panel2LEmpty');
    const p2RUC = gsap.utils.toArray('.panel2RUC');
    const p2RDC = gsap.utils.toArray('.panel2RDC');
    const p2Empty = gsap.utils.toArray('.panel2Empty');
    const p2Impact = gsap.utils.toArray('.panel2Impact');
    const p2Short = gsap.utils.toArray('.panel2Short');
    const frameP3 = gsap.utils.toArray('.panel3');
    const frameP6 = gsap.utils.toArray('.panel6');
    const framep11 = gsap.utils.toArray('.panel11');

    gsap.set([...p2LDC, ...p2LUC, ...p2RDC, ...p2RUC, ...p2LEmpty, ...p2Empty, ...p2Impact, ...p2Short, ...frameP6], { autoAlpha: 0 });
    gsap.set(frameP3[1], { autoAlpha: 0 }); gsap.set(frameP3[2], { autoAlpha: 1 }); gsap.set(frameP3[3], { autoAlpha: 1 });

    const narizMartela = gsap.utils.toArray('.narizMartela');
    const walkPainel1 = gsap.utils.toArray('.walkPainel1');
    const panteraP2 = gsap.utils.toArray('.panteraP2');
    const narizP2 = gsap.utils.toArray('.narizP2');
    const narizP3 = gsap.utils.toArray('.narizP3');
    const panteraP3 = gsap.utils.toArray('.panteraP3');
    const panteraP4 = gsap.utils.toArray('.panteraP4');
    const p3Cut = gsap.utils.toArray('.p3Cut');
    const narizP5 = gsap.utils.toArray('.narizP5');
    const narizP6 = gsap.utils.toArray('.narizP6');
    const narizP7 = gsap.utils.toArray('.narizP7');
    const narizP8 = gsap.utils.toArray('.narizP8');
    const narizP10 = gsap.utils.toArray('.narizP10');
    const narizP11 = gsap.utils.toArray('.narizP11');
    const panteraP11 = gsap.utils.toArray('.panteraP11');
    const narizP12 = gsap.utils.toArray('.narizP12');
    const narizP13 = gsap.utils.toArray('.narizP13');
    const sequenceP14 = gsap.utils.toArray('.narizP14');

    gsap.set([...narizMartela, ...walkPainel1, ...panteraP2, ...narizP2, ...narizP3, ...p3Cut, ...panteraP3, ...narizP5, ...narizP6, ...narizP8, ...narizP10, ...narizP11, ...panteraP11, ...narizP12, ...narizP13], { autoAlpha: 0 });
    
    const stepDuration = 1; 
    const lengthFrames = narizMartela.length - 1;
    const panel1 = gsap.timeline({
      scrollTrigger: {
        trigger: "#svgfundo",
        start: "top top",
        end: "+=440%",
        scrub: true,
        pin: true,
        markers: false,
      },
    });

    
    function addFrames(offset = 0) {
      narizMartela.forEach((frame, index) => {
        panel1.set(frame, { autoAlpha: 1 }, offset + index * stepDuration);
        if(index === lengthFrames){
          panel1.set(frame, { autoAlpha: 0 }, offset + (index+1) * stepDuration);
        }
        if (index > 0) {
          panel1.set(narizMartela[index - 1], { autoAlpha: 0 }, offset + index * stepDuration);
        }
      });
    }
    addFrames(0);  
    addFrames((lengthFrames+1));  
    const lengthWalkP1 = walkPainel1.length - 1;
    const offsetWalk = ((lengthFrames+1)*stepDuration*2)
    walkPainel1.forEach((frame, index) => {
        panel1.set(frame, { autoAlpha: 1 }, offsetWalk + index * stepDuration);
        if(index === lengthWalkP1){
          panel1.set(frame, { autoAlpha: 0 }, offsetWalk + (index+1) * stepDuration);
        }
        if (index > 0) {
          panel1.set(walkPainel1[index - 1], { autoAlpha: 0 }, offsetWalk + index * stepDuration);
        }
      });
      
    var panel2 = gsap.timeline({
      scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=9.5%",
        end: "+=1000%",
        scrub: true,
        pin: true,
        markers:false,
        
      },
    });
    //PanteraWalks
    const offsetP2 = (panteraP2.length+1) * stepDuration;
    panteraP2.forEach((frame, index) => {
        panel2.set(frame, { autoAlpha: 1 }, index * stepDuration);
        if(index === 14) {
          panel2.set(p2LDC[0], {autoAlpha:1}, index * stepDuration)
          panel2.set(p2F[0], {autoAlpha:0}, index * stepDuration)
        }
        if(index === 18) {
          panel2.set(p2LUC[0], {autoAlpha:1}, index * stepDuration)
          panel2.set(p2LDC[0], {autoAlpha:0}, index * stepDuration)
        }
        if(index === 20) {
          panel2.set(p2LEmpty[0], {autoAlpha:1}, index * stepDuration)
          panel2.set(p2LUC[0], {autoAlpha:0}, index * stepDuration)
        }
        if(index === 22) {
          panel2.set(p2RUC[0], {autoAlpha:1}, index * stepDuration)
          panel2.set(p2LEmpty[0], {autoAlpha:0}, index * stepDuration)
        }
        if(index === 26) {
          panel2.set(p2RDC[0], {autoAlpha:1}, index * stepDuration)
          panel2.set(p2RUC[0], {autoAlpha:0}, index * stepDuration)
        }
        if(index === 28) {
          panel2.set(p2Empty[0], {autoAlpha:1}, index * stepDuration)
          panel2.set(p2RDC[0], {autoAlpha:0}, index * stepDuration)
        }
        if(index === lengthWalkP1){
          panel2.set(frame, { autoAlpha: 0 },(index+1) * stepDuration);
        }
        if (index > 0) {
          panel2.set(panteraP2[index - 1], { autoAlpha: 0 },index * stepDuration);
        }
      });
      //Pantera Cutting
      panel2.to(panteraP2[30], {y:-10, scale:1.1},offsetP2+1)
      .set(panteraP2[30],{css: {zIndex: 5, transformOrigin:'center'}},offsetP2+2)
      .to(panteraP2[30], {y:20, scale:1.2,transformOrigin:'center'},offsetP2+2)
      .set(panteraP2[30], {autoAlpha: 0}, offsetP2+3)
      .set(narizP2[0],{ scale:1.2,transformOrigin:'center'},offsetP2+6)
      .set(narizP2[0], {autoAlpha: 1}, offsetP2+6)
      .to(narizP2[0], {y:-20, scale:1.1,transformOrigin:'center'}, offsetP2+7)
      .to(narizP2[0], {y:10, scale:1,transformOrigin:'center'}, offsetP2+8)
      .set(narizP2[0], {css: {zIndex: 3}}, offsetP2+8)
      .set(p2Impact, {autoAlpha: 1}, offsetP2+9)
      .set(p2Impact, {autoAlpha: 0}, offsetP2+10)
      .set(p2Short, {autoAlpha: 1}, offsetP2+10)
      .set(narizP2[0], {autoAlpha: 0}, offsetP2+11)
      .set(narizP2[1], {autoAlpha: 1}, offsetP2+11)
      .set({},{autoAlpha:0}, offsetP2+13);
      
    var panel3 = gsap.timeline({
      scrollTrigger: {
      trigger: "#svgfundo",
      start: "top+=18.8%",
      end: "+=1000%",
      scrub: true,
      pin: true,
      markers:false,
      onUpdate: function(self) {
        if (!panel3fallFired && self.progress >= 0.999) {
        panel3fallFired = true;
        panel3Fall?.play();
        // Clear the callback after firing
        self.vars.onUpdate = null;
        }
      }
      },
    });

    for(var i=0; i < 8; i++){
      panel3.set(narizP3[i%2], {autoAlpha: 1}, i * stepDuration);
      if(i>0){
        panel3.set(narizP3[(i-1)%2], {autoAlpha: 0}, i * stepDuration);
      }if(i>=6){
        
        panel3.set(p3Cut[(i%2)+2], {autoAlpha: 1}, i * stepDuration);
        if(i>=7){
          panel3.set(p3Cut[((i-1)%2)+2], {autoAlpha: 0}, i * stepDuration);
        }
      }
      else if(i>=4){
        panel3.set(p3Cut[i%2], {autoAlpha: 1}, i * stepDuration);
        if(i>=5){
          panel3.set(p3Cut[(i-1)%2], {autoAlpha: 0}, i * stepDuration);
          panel3.set(p3Cut[i%2], {autoAlpha: 0}, (i+1) * stepDuration);
        }
      }
    }
    const offsetP3 = 8 * stepDuration;
    panel3.set(p3Cut[3],{autoAlpha:0}, offsetP3);
    panel3.set(narizP3[1], {autoAlpha: 0}, offsetP3);
    var frameOffset = 2;
    var narizOffset = 4;
    var stepP3 = 2;
    for(i=0;i<16;i++){
      if(i<4){
        panel3.set(narizP3[(i%2)+2], {autoAlpha: 1}, offsetP3 + i * stepP3);
        panel3.set(p3Cut[(i)%2+4], {autoAlpha:1}, offsetP3 + i * stepP3);
        if(i>0){  
          panel3.set(narizP3[((i-1)%2)+2], {autoAlpha: 0}, offsetP3 + i * stepP3);
          panel3.set(p3Cut[((i-1)%2)+4], {autoAlpha: 0}, offsetP3 + i * stepP3);
        }
        if(i===3){
          panel3.set(narizP3[2], {autoAlpha: 1}, offsetP3 + 4 * stepP3);
          panel3.set(p3Cut[4], {autoAlpha:1}, offsetP3 + 4 * stepP3);
          panel3.set(narizP3[3], {autoAlpha: 0}, offsetP3 + 4 * stepP3);
          panel3.set(p3Cut[5], {autoAlpha:0}, offsetP3 + 4 * stepP3);
        }
      }
      else if(i>=4){  
        if(i===4){
          panel3.set(narizP3[2], {autoAlpha: 0}, offsetP3 + i * stepDuration + 10);
          panel3.set(p3Cut[4], {autoAlpha:0}, offsetP3 + i * stepDuration + 10);
        }
        panel3.set(narizP3[i%2+narizOffset], {autoAlpha: 1}, offsetP3 + i * stepDuration + 10);
        panel3.set(p3Cut[(i)%2+4+frameOffset], {autoAlpha:1}, offsetP3 + i * stepDuration + 10);
        panel3.set(narizP3[(i-1)%2+narizOffset], {autoAlpha: 0}, offsetP3 + i * stepDuration + 10);
        panel3.set(p3Cut[((i-1)%2)+4+frameOffset], {autoAlpha: 0}, offsetP3 + i * stepDuration + 10);
        if(i%2===1){
          panel3.set(p3Cut[((i)%2)+4+frameOffset], {autoAlpha: 0}, offsetP3 + i * stepDuration + 11);
          frameOffset = frameOffset + 2;
        } if(i===10){narizOffset = narizOffset + 2;
          panel3.set(narizP3[(i-1)%2+3], {autoAlpha: 0}, offsetP3 + i * stepDuration + 11);
        }
      }
    }
    panel3.set(narizP3, {autoAlpha: 0}, offsetP3 + 26)
      .set(p3Cut,{autoAlpha:0}, offsetP3 + 26)
    panel3.eventCallback("onComplete", () => { blockRef.current.down = true; blockRef.current.up = true;});

    var panel3Fall = gsap.timeline({
      paused: true,
      
    })
      .set(frameP3[1], {autoAlpha: 1, zIndex: 4})
      .set(frameP3[2], {autoAlpha: 0, zIndex: 4},"<")
      
      .to(frameP3[1], { transformOrigin:'bottom center', rotation:-120, duration:3, ease: "expo.in"},">")
      .to(frameP3[2], { transformOrigin:'bottom center', rotation:-120, duration:3, ease: "expo.in"},"<")
      .set(frameP3[0], {autoAlpha: 0, zIndex: 4},"<")
      .set(frameP3[3],{autoAlpha:0},"<")
      .set([...p2LDC, ...p2LUC, ...p2RDC, ...p2RUC, ...p2LEmpty, ...p2Empty, ...p2Impact, ...p2Short, ...narizP2], { autoAlpha: 0 },"<")
      const duration = 0.2; //time duration for each time it switches opacity, the lower the faster
      const times = Math.floor(3 / duration); //Divides the duration of the rotation to know how many times it needs to switch opacity

      for (let i = 0; i <= times; i++) {
        const time = i * duration;
        if (i % 2 === 0) {
          panel3Fall.set(frameP3[1], { autoAlpha: 0 }, time);
          panel3Fall.set(frameP3[2], { autoAlpha: 1 }, time);
        } else {
          panel3Fall.set(frameP3[1], { autoAlpha: 1 }, time);
          panel3Fall.set(frameP3[2], { autoAlpha: 0 }, time);
        }
      }
      panel3Fall.set(frameP3[1],{autoAlpha:0}, ">")
      .set(frameP3[2],{autoAlpha:0},"<")
      
      panel3Fall.eventCallback("onComplete", () => { if(!panel3panteraFired){ panel3panteraFired = true;panel3Pantera.play();} });

    var panel3Pantera = gsap.timeline({
      scrub:true,
      paused: true,
      }).set(panteraP3[0], {autoAlpha: 1})
      .set(panteraP3[0],{autoAlpha:0},1)
      .set(panteraP3[1], {autoAlpha: 1}, 1)
      .eventCallback("onComplete", () => { blockRef.current.down = false; 
        console.log("Panel 3 Pantera completed scroll down ENABLED");
      });
   
    var panel4 = gsap.timeline({
      scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=34%",
        end: "+=500%",
        scrub: true,
        pin: true,
        markers:false,
        onEnter: () => { 
          //panel1.kill();
          //panel2.kill();
          //panel3.kill();
          blockRef.current.down = false; 
          blockRef.current.up = false; 
          corteHandleRef.current?.release?.(); corteHandleRef.current = null;
          cancelCorte();
          narizP2.length = 0;
          narizP3.length = 0;
          narizMartela.length = 0;
          walkPainel1.length = 0;
          panteraP2.length = 0;
          panteraP3.length = 0;
        },
        onLeaveBack: () => { blockRef.current.down = false; blockRef.current.up = true; },
      },
    }).set(panteraP4[0], {y:80},0)
    .set(panteraP4[0], {y:20},0.5)
    .set(panteraP4[0], {y:80},1)
    .set(panteraP4[0], {y:20},1.5)
    .set(panteraP4[0], {y:80},2)
    .set(panteraP4[0], {y:20},2.5)


    var panel5 = gsap.timeline({
      scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=44%",
        end: "+=500%",
        scrub: true,
        pin: true,
        markers:false,
      },
    })
    for (let i = 0; i <= 9; i++) {
      console.log("showing image number: ", i%3);
      panel5.set(narizP5[i%3], { autoAlpha: 1 }, i*stepDuration);
      if(i>0){
        console.log("hiding image number: ", (i-1)%3);
        panel5.set(narizP5[(i-1)%3], { autoAlpha: 0 }, i*stepDuration);
      }

    }
      
    var panel6 = gsap.timeline({
      scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=47%",
        end: "+=500%",
        scrub: true,
        pin: true,
        markers:false,
        onUpdate: function(self) {
          if (!panel6fallFired && self.progress >= 0.999) {
          panel6fallFired = true;
          panel6Fall?.play();
          // Clear the callback after firing
          self.vars.onUpdate = null;
          }
        }
      },
    })
    for(let i=0; i < 7; i++){
        panel6.set(narizP6[i], { autoAlpha: 1 },i * stepDuration);
        if(i === 6){
          panel6.set(narizP6[i], { autoAlpha: 0 }, (i+1) * stepDuration);

        }
        if (i > 0) {
          panel6.set(narizP6[i - 1], { autoAlpha: 0 }, i * stepDuration);
        }
    }
    panel6.eventCallback("onComplete", () => { blockRef.current.down = true; blockRef.current.up = true;});
    var panel6Fall = gsap.timeline({
      paused: true,
    }).set(frameP6, {autoAlpha: 1})
    for(let i=7; i<=10; i++){
      panel6Fall.set(narizP6[i], { autoAlpha: 1 },(i-7) * stepDuration/3);
      
      if (i > 0) {
        panel6Fall.set(narizP6[i - 1], { autoAlpha: 0 }, (i-7) * stepDuration/3);
      }
    }
    panel6Fall.to(narizP6[10], {y:400, x:-120, duration:0.7},"<")
      .set(narizP6[10], {autoAlpha:0},">")
    panel6Fall.eventCallback("onComplete", () => { blockRef.current.up = true; blockRef.current.down = false;});
    
    var panel7n8 = gsap.timeline({
    scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=58.4%",
        end: "+=500%",
        pin: true,
        scrub:false,
        markers:false,
        onEnter: () => { blockRef.current.down = true; blockRef.current.up = true; 
        },
      },
    })
    .to(narizP7[0], {y:565, x:-709, duration:1}).to(narizP7[1], {y:565, x:-709, duration:1},"<").to(narizP7[2], {y:565, x:-709, duration:1},"<");
    const p7times = 9;
    const p7duration = 1/ p7times; //time duration for each time it switches opacity, the lower the faster
    for (let i = 0; i <= p7times; i++) {
      const time = i * p7duration;
      if (i % 3 === 0) {
        panel7n8.set(narizP7[0], { autoAlpha: 1 }, time);
        panel7n8.set(narizP7[1], { autoAlpha: 0 }, time);
        panel7n8.set(narizP7[2], { autoAlpha: 0 }, time);
      } else if (i%3 === 1){
        panel7n8.set(narizP7[1], { autoAlpha: 1 }, time);
        panel7n8.set(narizP7[0], { autoAlpha: 0 }, time);
        panel7n8.set(narizP7[2], { autoAlpha: 0 }, time);
      } else {
        panel7n8.set(narizP7[2], { autoAlpha: 1 }, time);
        panel7n8.set(narizP7[1], { autoAlpha: 0 }, time);
        panel7n8.set(narizP7[0], { autoAlpha: 0 }, time);
      }
    }
    panel7n8.set(narizP8[0], {autoAlpha:1},">1")
    .to(narizP8[0], {y:565, duration:0.3}, "<")
    .set(narizP8[0], {autoAlpha:0},2.28)
    .set(narizP8[1], {autoAlpha:1},"<")
    .to(narizP8[1], {y:1000, x:-500, scale:1.5, transformOrigin: 'top center', duration:1, ease:"power.in"}, "<")
    .set(narizP8[1], {autoAlpha:0},">")
    .set(narizP8[2], {autoAlpha:1},">") 
    .to(narizP8[2], {y:600, x:-800, scale:0.5, duration:1},">1") //this is panel 9, but I kept it here for organization and simplification
    .eventCallback("onComplete", () => { blockRef.current.up = true; blockRef.current.down = false;});
    
    var panel10cimentoLower = gsap.timeline({
      paused:true,
    });
    panel10cimentoLower.set('.narizP10first',{autoAlpha:0})
    .to(narizP10[7],{y:30, duration:1.5},">")
    .to(narizP10[4], {y:60, duration:2},"<")
    .eventCallback("onComplete", () => { blockRef.current.up = true; blockRef.current.down = false;});

    var panel10cimento = gsap.timeline({
    scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=60.4%",
        end: "+=100%",
        pin: true,
        scrub:false,
        markers:false,
        onEnter: async () => { 
          blockRef.current.down = true; 
          blockRef.current.up = true; 

          commonHandleRef.current = await preloadImages([...narizCommon, ...panteraCommon], { 
          concurrency: 4, 
          keepAlive: true, 
          tolerateErrors: true,       // don't abort all on a single failure
          crossOrigin: "anonymous",   // if you draw to canvas; otherwise omit
          revokeBlobURLsOnRelease: false,
          label: "page 2",});

          panteraP4.length = 0;
          p3Cut.length = 0;
          narizP5.length = 0;
          narizP6.length = 0;
          narizP7.length = 0;
          narizP8.length = 0;
        },
        onUpdate: function(self) {
        if (!panel10cimentoFired && self.progress >= 0.999) {
        panel10cimentoFired = true;
        panel10cimento?.play();
        // Clear the callback after firing
        self.vars.onUpdate = null;
        }
      }
      },
    }).set('.narizP10first',{y:-600, x:800})
    .set('.narizP10first', {autoAlpha:1})
    .to('.narizP10first', {y:0, x:0, duration:0.8, ease:"power2.in"},">")
    const offsetP10 = 0.8;
    for(var i=0; i<=4; i++){
        panel10cimento.set(narizP10[i], { autoAlpha: 1 }, offsetP10 + i * stepDuration/5);

        if(i===4){
          panel10cimento.set(narizP10[0], { autoAlpha: 0 }, offsetP10 + i * stepDuration/5);
          panel10cimento.set(narizP10[5],{autoAlpha:1},offsetP10 + i * stepDuration/5);
          panel10cimento.set(narizP10[6],{autoAlpha:1},offsetP10 + i * stepDuration/5);
          panel10cimento.set(narizP10[7],{autoAlpha:1},offsetP10 + i * stepDuration/5);
          panel10cimento.set(narizP10[8],{autoAlpha:1},offsetP10 + i * stepDuration/5);
        }
    }
  
    panel10cimento.set(narizP10[3], { autoAlpha: 0 }, offsetP10 + 4 * stepDuration/5);
    panel10cimento.set(narizP10[2], { autoAlpha: 0 }, offsetP10 + 4 * stepDuration/5);
    panel10cimento.set(narizP10[1], { autoAlpha: 0 }, offsetP10 + 4 * stepDuration/5);

    panel10cimento.eventCallback("onComplete", () => { panel10cimentoLower.play();});
    
    var panel10cimentoScrub = gsap.timeline({
      scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=60.41%", // start right after previous so we can have a timeline with scrub right in the same spot as a scrubless one
        end: "+=600%",             
        pin: true,
        scrub: true,
        markers:false,
        onLeave: () => {gsap.set(narizP10[8], {autoAlpha:0}); gsap.set(narizP10[9], {autoAlpha:1});},
        onLeaveBack: () => {blockRef.current.up = true;
        },
        onEnter: () => {
          blockRef.current.up = false;
          //panel4.kill();
          //panel5.kill();
          //panel6.kill();
          //panel7n8.kill();
        },
        onEnterBack: () => {blockRef.current.up = true;},
      }
    })
    .to(narizP10[7], {y:110, duration:3})
    .to(narizP10[4], {y:100, duration:2},"<")
    .to(narizP10[5],{y:100, duration:3},"<")
    .to(narizP10[6],{y:20,duration:2},"<")
    .to(narizP10[4],{y:1500, duration:5},3)
    .to(narizP10[5],{y:1080, duration:5},3)
    .to(narizP10[6],{y:1300, duration:5},3)
    .to(narizP10[7],{y:1200, duration:5},3)
    .set(narizP10.slice(4,8),{autoAlpha:0},">");
     

    var panel11 = gsap.timeline({ //Panel 11 and 12, but I only wrote 11 and it has too much appearances of the panel11 variable, so the name stays panel11
      scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=68.41%", 
        end: "+=1200%",             
        pin: true,
        scrub: true,
        markers:false,
        onLeaveBack: () => {blockRef.current.up = true;},
        onEnter: async () => {
          //panel10cimento.kill();
          //panel10cimentoScrub.kill();
          //panel10cimentoLower.kill();
          blockRef.current.up = false;
          panel11HandleRef.current = await preloadImages([...lastPanel], { concurrency: 4, keepAlive: true, string:"lastpanel" });
        }
        
      }
    })
    for(let i = 0; i <= 3; i++){
      panel11.set(panteraP11[i], {autoAlpha:1}, i*stepDuration);
      if (i>0){
        panel11.set(panteraP11[i-1], {autoAlpha:0}, i*stepDuration);
      }
    }
    panel11.set(panteraP11[3], {autoAlpha:0}, 5*stepDuration)
    .set(panteraP11[4], {autoAlpha:1}, 5*stepDuration)
    .set(panteraP11[4], {autoAlpha:0}, 7*stepDuration)
    const offsetP11 = 7*stepDuration;
    for(let i = 0; i < 4; i++){
      panel11.set(panteraP11[(i)%2+5], {autoAlpha:1}, i*stepDuration + offsetP11);
      if (i>0){
        panel11.set(panteraP11[(i-1)%2+5], {autoAlpha:0}, i*stepDuration + offsetP11);
      }
      if(i === 3){
        panel11.set(panteraP11[(i)%2+5], {autoAlpha:0}, (i+1)*stepDuration + offsetP11);
      }
    }
    
    const offset2P11 = offsetP11 + 4;
    panel11.set(framep11, {autoAlpha:0}, offset2P11);
    for(let i = 0; i < 8; i++){
      panel11.set(panteraP11[(i)%2+7], {autoAlpha:1}, i*stepDuration/2 + offset2P11);
      if (i>0){
        panel11.set(panteraP11[(i-1)%2+7], {autoAlpha:0}, i*stepDuration/2 + offset2P11);
      }
      if(i === 7){
        panel11.set(panteraP11[(i)%2+7], {autoAlpha:0}, i*stepDuration/2 + offset2P11+0.5);
      }
    }
    const offset3P11 = offset2P11 + 4;
    for(let i = 0; i<10; i++){
      for(let j = 0; j<2; j++){
        panel11.set(panteraP11[(i)%2+9], {autoAlpha:1}, i*stepDuration + offset3P11+j/2);
        if (i>0){
          panel11.set(panteraP11[(i-1)%2+9], {autoAlpha:0}, i*stepDuration + offset3P11+j/2);
        }
      }
      if(i<7){
         panel11.set(narizP11[i], {autoAlpha:1}, i*stepDuration + offset3P11);
        if(i>0){
          panel11.set(narizP11[i-1], {autoAlpha:0}, i*stepDuration + offset3P11);
        }
      }
    }
    const offset4P11 = offset3P11 + 10;
    panel11.set('.panel12', {autoAlpha: 1}, ">");
    narizP12.forEach((frame, index) => {
        panel11.set(frame, { autoAlpha: 1 }, offset4P11 + index * stepDuration);
        
        if (index > 0) {
          panel11.set(narizP12[index - 1], { autoAlpha: 0 }, offset4P11 + index * stepDuration);
        }
      });
    panel11.to({},{autoAlpha:0, duration: 2},">"); 
    var panel13 = gsap.timeline({ 
      scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=75%", 
        end: "+=600%",             
        pin: true,
        scrub: true,
        markers:false,
        onLeaveBack: () => {blockRef.current.up = true;},
        onEnter: () => {blockRef.current.up = false;
          cancelPanel11();
          panel11HandleRef.current?.release?.();
          panel11HandleRef.current = null;
          //panel11.kill();
        }
        
      }
    })
    narizP13.forEach((frame, index) => {
        panel13.set(frame, { autoAlpha: 1 }, index * stepDuration);
        
        if (index > 0) {
          panel13.set(narizP13[index - 1], { autoAlpha: 0 }, index * stepDuration);
        }
      });
    panel13.set({},{autoAlpha:0},6);

    
    const offsetP14 = 5;
    var panel14 = gsap.timeline({ 
      scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=84%", 
        end: "+=1800%",             
        pin: true,
        scrub: true,
        markers:false,
        onEnter: () => {
          commonHandleRef.current?.release?.();
          commonHandleRef.current = null;
          cancelCommon();
          //panel13.kill();
          preloadHandleRef.current?.release();
          preloadHandleRef.current = null;
          cancel();
          console.log("cancelled other panels and preload released! on panel 14");
          blockRef.current.up = false;
        },
        onLeaveBack: () => {blockRef.current.up = true;},
      }
    }).to(sequenceP14[0], {x:'-19%', duration:2}, 3)
    sequenceP14.slice(0,6).forEach((frame, index) => {
      panel14.set(frame, { autoAlpha: 1 }, index * stepDuration + offsetP14);

      if (index > 0) {
        panel14.set(sequenceP14[index - 1], { autoAlpha: 0 }, index * stepDuration + offsetP14);
      }
    });
    const offset2P14 = offsetP14 + 5;
    
    panel14.to(sequenceP14[5], { x: '-18%', duration: 2 }, offset2P14);
    sequenceP14.slice(6,20).forEach((frame, index) => {
      panel14.set(frame, { autoAlpha: 1 }, index * stepDuration + offset2P14+2);

      if (index > 0) {
        panel14.set(sequenceP14[index - 1], { autoAlpha: 0 }, index * stepDuration + offset2P14+2);
      }
    });
    const offset3P14 = offset2P14 + 16;
    panel14.to(sequenceP14[19], {x:'-18%', duration:2}, offset3P14);
    sequenceP14.slice(20,23).forEach((frame, index) => {
      panel14.set(frame, { autoAlpha: 1 }, index * stepDuration + offset3P14+2);

      if (index > 0) {
        panel14.set(sequenceP14[index - 1], { autoAlpha: 0 }, index * stepDuration + offset3P14+2);
      }
    });
    panel14.to({}, {},offset3P14 + 7)
    requestAnimationFrame(() => {
      console.log("refreshing scroll trigger at the end!");
    ScrollTrigger.refresh(true);
  });

  var navigateNext = gsap.timeline({
  scrollTrigger: {
    trigger: "#svgfundo",
    start: "top+=90%",
    end: "+=300%",
    pin: true,
    markers: true,
    onEnter: () => {
      requestAnimationFrame(() => navigate('/page3'));
    },
  },
});
  }, { scope: mainRef,dependencies: [ready] });

    useEffect(() => {
    return () => {
      if (blockRef.current) {
        blockRef.current.up = false;
        blockRef.current.down = false;
      }
      // Add cleanup code
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.killTweensOf("*");
      cancel();
    };
  }, []);

  return (
    <div ref={mainRef}style={{justifyContent: 'stretch',display: 'flex',position: 'relative', top: 0,left: 0,width: '100%', visibility: ready ? 'visible' : 'hidden'}}>
      {ready && (
      <>
      <div id="smooth-content"style={{overflowY:'hidden'}}>
      <RemoveScrollBar /> 
      <div id="svgfundo" style={{backgroundColor:'black', display: 'block', width: '100vw',overflowX:'hidden', overflowY:'hidden'}}>
{/**BG - FG */}
        <img src={bgImage1} className="background" decoding="async" loading="eager"  style={{ position:'relative', top:'0', left:'0',width: '100%', minHeight:'100vh', height: 'auto' , zIndex: '0', visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[1]} className="objetos" decoding="async" loading="eager" style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '2', visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[2]} className="paineis" decoding="async" loading="eager" style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '6', opacity: 1, visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[14]} className="panel3" decoding="async" loading="eager" style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '6', opacity:1, visibility:'visible'}} /> {/* blue background */}

{/**Panel2 frame */}        
        <img src={bgImages[3]} className="panel2Full"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '4', visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[4]} className="panel2LDC"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[5]} className="panel2LUC"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[6]} className="panel2LEmpty"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[7]} className="panel2RUC"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[8]} className="panel2RDC"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[9]} className="panel2Empty"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[10]} className="panel2Impact"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '8',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[11]} className="panel2Short"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '8',  opacity:0, visibility:'visible'}} /> {/* blue background */}

{/**Panel3 frame */}
        <img src={bgImages[12]} className="panel3 upperCima"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '-4', opacity:0, visibility:'hidden'}} /> {/* blue background */}
        <img src={bgImages[13]} className="panel3 upperBaixo"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '-4', opacity:0, visibility:'hidden'}} /> {/* blue background */}
        <img src={bgImages[15]} className="panel3 tip"  style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '2', opacity:1, visibility:'visible'}} /> {/* blue background */}
  
{/**Panel6 Frame */}
        <img src={bgImages[16]} className="panel6"  style={{ position:'absolute', top:'49.3%', left:'0',width: '100%', height: 'auto' , zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
{/**Panel11 Frame on Panel 12 (to cover the Panther's tail)*/}
        <img src={bgImages[17]} className="panel11"  style={{ position:'absolute', top:'71%', left:'0',width: '100.1%', height: 'auto' , zIndex: '10', opacity:1, visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[18]} className="panel12"  style={{ position:'absolute', top:'70.14%', left:'0',width: '100.1%', height: 'auto' , zIndex: '8', opacity:0, visibility:'visible'}} /> {/* blue background */}
{!cancelled && (
          <>        
{/**Panel3 cut panel */}
        <img src={cortePainel[0]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[1]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[2]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[3]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[4]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[5]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[6]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[7]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[8]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[9]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[10]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[11]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[12]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[13]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[14]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[15]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[16]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[17]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[18]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[19]} className="p3Cut"  style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={cortePainel[20]} className="p3Cut" id="p3Last" style={{ position:'absolute', top:'22.1%',width:'62%',height:'auto', right:'0', zIndex: '7', opacity:0, visibility:'visible'}} /> {/* blue background */}
       
       {/**Painel1 */}
        <img src={narizImages[0]} className="narizMartela" decoding="async" loading="eager"  style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[1]} className="narizMartela" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[2]} className="narizMartela" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[3]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[4]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[5]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[6]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[7]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[8]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[9]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[10]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[11]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[12]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'0', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}

        <img src={narizImages[5]} className="walkPainel1" decoding="async" loading="eager"  style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'20%', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[6]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'20%', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[7]} className="walkPainel1" decoding="async" loading="eager" style={{ position:'absolute', width:"100%", height:"auto", top:'0', left:'20%', zIndex: '1',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/**Painel 2 */}      
        <img src={panteraImages[0]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'auto',height:'auto', left:'30%', zIndex: '3', visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[1]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'auto',height:'auto', left:'27%', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[2]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'auto',height:'auto', left:'23%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[3]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'auto',height:'auto', left:'23%', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[4]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'auto',height:'auto', left:'23%', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[5]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'auto',height:'auto', left:'22%', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[6]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'auto',height:'auto', left:'22%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[7]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'auto',height:'auto', left:'22%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[8]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[9]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[10]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[11]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[12]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        {/* starts sawing*/ }{/* left down*/ }
        <img src={panteraImages[13]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/*14*/}<img src={panteraImages[14]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[13]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[14]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        {/* left up*/ }
        <img src={panteraImages[15]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'84%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/*18*/}<img src={panteraImages[16]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'84%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[15]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'84%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[16]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'84%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/*20*/}{/*right up*/ }
        <img src={panteraImages[17]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[18]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/*22*/}<img src={panteraImages[17]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[18]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        {/* right down*/ }
        <img src={panteraImages[19]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/*24*/}<img src={panteraImages[20]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[19]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/*26*/}<img src={panteraImages[20]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        {/* stops sawing*/ }
        <img src={panteraImages[21]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[22]} className="panteraP2"  style={{ position:'absolute', top:'11%', width:'83%',height:'auto', left:'8%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[13]} className="narizP2"  style={{ position:'absolute', top:'12%', left:'22%', width:'64%',height:'auto' , zIndex: '5',  opacity:0, visibility:'visible'}} /> {/* blue background */}        
        <img src={narizImages[14]} className="narizP2"  style={{ position:'absolute', top:'12%', left:'22%', width:'64%',height:'auto' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}        
{/** Panel 3 */}      
        <img src={narizImages[15]} className="narizP3"  style={{ position:'absolute', top:'20%', left:'35%',width:'28%', height:'auto', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}        
        <img src={narizImages[16]} className="narizP3"  style={{ position:'absolute', top:'20%', left:'35%',width:'28%', height:'auto', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}        
      <img src={narizImages[17]} className="narizP3"  style={{ position:'absolute', top:'20%', left:'35%',width:'28%', height:'auto', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}        
        <img src={narizImages[18]} className="narizP3"  style={{ position:'absolute', top:'20%', left:'35%',width:'28%', height:'auto', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}        
      <img src={narizImages[19]} className="narizP3"  style={{ position:'absolute', top:'20%', left:'35%',width:'28%', height:'auto', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}        
        <img src={narizImages[20]} className="narizP3"  style={{ position:'absolute', top:'20%', left:'35%',width:'28%', height:'auto', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}        
      <img src={narizImages[21]} className="narizP3"  style={{ position:'absolute', top:'20%', left:'35%',width:'28%', height:'auto', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}        
        <img src={narizImages[22]} className="narizP3"  style={{ position:'absolute', top:'20%', left:'35%',width:'28%', height:'auto', zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}        
        <img src={panteraImages[23]} className="panteraP3"  style={{ position:'absolute', top:'21%', width:'24%',height:'auto', right:'27%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[24]} className="panteraP3"  style={{ position:'absolute', top:'21%', width:'24%',height:'auto', right:'27%' , zIndex: '3',  opacity:0, visibility:'visible'}} /> {/*7blue background */}
{/**Panel 4 */}    
        <img src={panteraImages[25]} className="panteraP4"  style={{ position:'absolute', top:'35%', width:'100%',height:'auto', right:'0' , zIndex: '4',  opacity:1, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[26]} className="panteraP4"  style={{ position:'absolute', top:'35%', width:'100%',height:'auto', right:'0', zIndex: '3',  opacity:1, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraImages[27]} className="panteraP4"  style={{ position:'absolute', top:'35%', width:'100%',height:'auto', right:'0' , zIndex: '5',  opacity:1, visibility:'visible'}} /> {/* blue background */}
{/**Panel 5 */}
        <img src={narizImages[23]} className="narizP5"  style={{ position:'absolute', top:'44.5%', width:'18%',height:'auto', left:'21%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[24]} className="narizP5"  style={{ position:'absolute', top:'44.5%', width:'18%',height:'auto', left:'21%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[25]} className="narizP5"  style={{ position:'absolute', top:'44.5%', width:'18%',height:'auto', left:'21%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/*Panel 6 */}
        <img src={narizImages[26]} className="narizP6"  style={{ position:'absolute', top:'49.4%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[27]} className="narizP6"  style={{ position:'absolute', top:'49.4%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[28]} className="narizP6"  style={{ position:'absolute', top:'49.4%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[29]} className="narizP6"  style={{ position:'absolute', top:'49.4%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[30]} className="narizP6"  style={{ position:'absolute', top:'49.4%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[31]} className="narizP6"  style={{ position:'absolute', top:'49.4%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[32]} className="narizP6"  style={{ position:'absolute', top:'49.4%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[33]} className="narizP6"  style={{ position:'absolute', top:'49.3%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[34]} className="narizP6"  style={{ position:'absolute', top:'49.3%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[35]} className="narizP6"  style={{ position:'absolute', top:'49.3%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */} 
        <img src={narizImages[36]} className="narizP6"  style={{ position:'absolute', top:'49.3%', width:'100%',height:'auto', right:'0' , zIndex: '7',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/*panel 7*/}
        <img src={narizImages[37]} className="narizP7"  style={{ position:'absolute', top:'56.3%', width:'8%',height:'auto', left:'50%' , zIndex: '4',  opacity:1, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[38]} className="narizP7"  style={{ position:'absolute', top:'56.3%', width:'8%',height:'auto', left:'50%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[39]} className="narizP7"  style={{ position:'absolute', top:'56.3%', width:'8%',height:'auto', left:'50%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/*panel "above stairs" - 8"*/}    
        <img src={narizImages[40]} className="narizP8"  style={{ position:'absolute', top:'50.3%', width:'40%',height:'auto', right:'0' , zIndex: '9',  opacity:1, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[41]} className="narizP8"  style={{ position:'absolute', top:'55.3%', width:'40%',height:'auto', right:'0' , zIndex: '9',  opacity:1, visibility:'visible'}} /> {/* blue background */}
{/*panel 9*/}        
        <img src={narizImages[41]} className="narizP8"  style={{ position:'absolute', top:'60%', width:'30%',height:'auto', left:'50%' , zIndex: '4',  opacity:1, visibility:'visible'}} /> {/* blue background */}
{/**Cimento Panel 10 */}
        <img src={narizImages[42]} className="narizP10first"  style={{ position:'absolute', top:'65.5%', width:'20%',height:'auto', right:'5%' , zIndex: '9',  opacity:1, visibility:'visible'}} /> {/* blue background */}

        <img src={narizImages[43]} className="narizP10"  style={{ position:'absolute', top:'59.4%', width:'100%',height:'auto', right:'0' , zIndex: '9',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[44]} className="narizP10"  style={{ position:'absolute', top:'59.4%', width:'100%',height:'auto', right:'0' , zIndex: '9',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[45]} className="narizP10"  style={{ position:'absolute', top:'59.4%', width:'100%',height:'auto', right:'0' , zIndex: '9',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[46]} className="narizP10"  style={{ position:'absolute', top:'59.4%', width:'100%',height:'auto', right:'0' , zIndex: '9',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[47]} className="narizP10"  style={{ position:'absolute', top:'59.4%', width:'100%',height:'auto', right:'0' , zIndex: '9',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[48]} className="narizP10"  style={{ position:'absolute', top:'59.4%', width:'100%',height:'auto', right:'0' , zIndex: '9',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[49]} className="narizP10"  style={{ position:'absolute', top:'59.4%', width:'100%',height:'auto', right:'0' , zIndex: '9',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[50]} className="narizP10"  style={{ position:'absolute', top:'59.4%', width:'100%',height:'auto', right:'0' , zIndex: '9',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[51]} className="narizP10"  style={{ position:'absolute', top:'59.4%', width:'100%',height:'auto', right:'0' , zIndex: '8',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={narizImages[52]} className="narizP10"  style={{ position:'absolute', top:'59.4%', width:'100%',height:'auto', right:'0' , zIndex: '8',  opacity:0, visibility:'visible'}} /> {/* blue background */}
{/** Painel 11 */}
{/*Panther*/}
        <img src={panteraCommon[2]} className="panteraP11"  style={{ position:'absolute', top:'71.4%', width:'17%',height:'auto', left:'42%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraCommon[3]} className="panteraP11"  style={{ position:'absolute', top:'71.4%', width:'17%',height:'auto', left:'40%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraCommon[4]} className="panteraP11"  style={{ position:'absolute', top:'71.4%', width:'17%',height:'auto', left:'38%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}
        <img src={panteraCommon[5]} className="panteraP11"  style={{ position:'absolute', top:'71.4%', width:'17%',height:'auto', left:'36%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> {/* blue background */}

        <img src={panteraImages[28]} className="panteraP11"  style={{ position:'absolute', top:'71.7%', width:'47%',height:'auto', left:'1%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={panteraImages[29]} className="panteraP11"  style={{ position:'absolute', top:'71.7%', width:'47%',height:'auto', left:'1%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={panteraImages[30]} className="panteraP11"  style={{ position:'absolute', top:'71.7%', width:'47%',height:'auto', left:'1%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={panteraImages[31]} className="panteraP11"  style={{ position:'absolute', top:'71.7%', width:'47%',height:'auto', left:'1%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={panteraImages[32]} className="panteraP11"  style={{ position:'absolute', top:'71.7%', width:'47%',height:'auto', left:'1%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={panteraImages[33]} className="panteraP11"  style={{ position:'absolute', top:'71.7%', width:'47%',height:'auto', left:'1%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={panteraImages[34]} className="panteraP11"  style={{ position:'absolute', top:'71.7%', width:'47%',height:'auto', left:'1%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>

{/*Nariz */}
        <img src={narizCommon[0]} className="narizP11"  style={{ position:'absolute', top:'72.2%', width:'11%',height:'auto', left:'16%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> 
        <img src={narizCommon[1]} className="narizP11"  style={{ position:'absolute', top:'72.2%', width:'11%',height:'auto', left:'18%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> 
        <img src={narizCommon[2]} className="narizP11"  style={{ position:'absolute', top:'72.2%', width:'11%',height:'auto', left:'20%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> 
        <img src={narizCommon[3]} className="narizP11"  style={{ position:'absolute', top:'72.2%', width:'11%',height:'auto', left:'22%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> 
        <img src={narizCommon[4]} className="narizP11"  style={{ position:'absolute', top:'72.2%', width:'11%',height:'auto', left:'24%' , zIndex: '4',  opacity:0, visibility:'visible'}} /> 
        <img src={narizCommon[5]} className="narizP11"  style={{ position:'absolute', top:'72.2%', width:'11%',height:'auto', left:'26%' , zIndex: '1',  opacity:0, visibility:'visible'}} /> 

        <img src={narizImages[53]} className="narizP11"  style={{ position:'absolute', top:'71.7%', width:'47.9%',height:'auto', left:'0%' , zIndex: '4',  opacity:1, visibility:'visible'}}/>
        
{/**Painel 12 */}
        <img src={narizImages[54]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'24%' , zIndex: '4',  opacity:1, visibility:'visible'}}/>
        <img src={narizImages[55]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'22%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[56]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'20%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[57]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'18%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[58]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'16%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[59]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'14%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[60]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'12%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[61]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'10%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[62]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'8%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[63]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'6%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[64]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'4%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[65]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'2%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>

        <img src={narizImages[66]} className="narizP12"  style={{ position:'absolute', top:'70.3%', width:'42%',height:'auto', right:'0%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>

{/** Painel 13 */}
        <img src={narizImages[67]} className="narizP13"  style={{ position:'absolute', top:'77.1%', width:'59.3%',height:'auto', right:'0%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[68]} className="narizP13"  style={{ position:'absolute', top:'77.1%', width:'59.3%',height:'auto', right:'0%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[69]} className="narizP13"  style={{ position:'absolute', top:'77.1%', width:'59.3%',height:'auto', right:'0%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[70]} className="narizP13"  style={{ position:'absolute', top:'77.1%', width:'59.3%',height:'auto', right:'0%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
        <img src={narizImages[71]} className="narizP13"  style={{ position:'absolute', top:'77.1%', width:'59.3%',height:'auto', right:'0%' , zIndex: '4',  opacity:0, visibility:'visible'}}/>
</>
)}
{/** Painel 14 */}
        <img src={lastPanel[0]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'30%' , zIndex: '1',  opacity:1, visibility:'visible'}} />
        <img src={lastPanel[1]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'10%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[2]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'10%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[3]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'10%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[4]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'10%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[5]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'10%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[6]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[7]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[8]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[9]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[10]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[11]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[12]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[13]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[14]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[15]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[16]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[17]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[18]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[19]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-8%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[20]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-27%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[21]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-27%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
        <img src={lastPanel[22]} className="narizP14"  style={{ position:'absolute', top:'85%', width:'100%',height:'auto', left:'-27%' , zIndex: '1',  opacity:0, visibility:'visible'}} />
      </div>
      </div>
      </>)}
      </div>
      
  );
}
