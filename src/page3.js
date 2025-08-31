import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import {ScrollTrigger, ScrollToPlugin} from 'gsap/all';
import Lenis from 'lenis';
import { useGSAP } from '@gsap/react';
import preloadImages from './preloadImages.js';
import getImages from './getImages.js';
import { RemoveScrollBar } from 'react-remove-scroll-bar';
import './page3.css';
import getWindowSize from './windowSize.js';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

// Import images
let bgImages = getImages(require.context('./imagesTest/page3/bgfg', true));
let firstSequence = getImages(require.context('./imagesTest/page3/panels/1stSequence', true));
let secondSequence = getImages(require.context('./imagesTest/page3/panels/2ndSequence', true));
let extraSequence = getImages(require.context('./imagesTest/page3/extra', true));
let thirdSequence = getImages(require.context('./imagesTest/page3/panels/3rdSequence', true)); 
let fourthSequence = getImages(require.context('./imagesTest/page3/panels/4thSequence', true));
let fifthSequence = getImages(require.context('./imagesTest/page3/panels/5thSequence', true));
let sixthSequence = getImages(require.context('./imagesTest/page3/panels/6thSequence', true));
let seventhSequence = getImages(require.context('./imagesTest/page3/panels/7thSequence', true));
let eighthSequence = getImages(require.context('./imagesTest/page3/panels/8thSequence', true));
let ninthSequence = getImages(require.context('./imagesTest/page3/panels/9thSequence', true));


export default function Page3() {  
  const mainRef = useRef(null);
  const [ready, setReady] = useState(false);
  const lenisRef = useRef(null);
  const rafIdRef = useRef(null);
  const blockRef = useRef({ up: true, down: true });
  let isScrollLocked = false;
  const startedPreloadRef = useRef(false);
  const [index, setIndex] = useState(12);
 

  const [cancelledFirstSequence, setCancelledFirstSequence] = useState(false);
  const [cancelledSecondSequence, setCancelledSecondSequence] = useState(false);
  const [cancelledExtraSequence, setCancelledExtraSequence] = useState(false);
  const [cancelledThirdSequence, setCancelledThirdSequence] = useState(false);
  const [cancelledFourthSequence, setCancelledFourthSequence] = useState(false); 
  const [cancelledFifthSequence, setCancelledFifthSequence] = useState(false); 
  const [cancelledSixthSequence, setCancelledSixthSequence] = useState(false); 
  const [cancelledSeventhSequence, setCancelledSeventhSequence] = useState(false); 
  const [cancelledEighthSequence, setCancelledEighthSequence] = useState(false);
  const [cancelledNinthSequence, setCancelledNinthSequence] = useState(false);

  const cancelledFirstSequenceRef = useRef(false);
  const cancelledSecondSequenceRef = useRef(false);
  const cancelledExtraSequenceRef = useRef(false); 
  const cancelledThirdSequenceRef = useRef(false); 
  const cancelledFourthSequenceRef = useRef(false); 
  const cancelledFifthSequenceRef = useRef(false); 
  const cancelledSixthSequenceRef = useRef(false);
  const cancelledSeventhSequenceRef = useRef(false); 
  const cancelledEighthSequenceRef = useRef(false);
  const cancelledNinthSequenceRef = useRef(false);
  
  let bgHandleRef = useRef(null);
  let firstSequenceHandleRef = useRef(null);
  let secondSequenceHandleRef = useRef(null);
  let thirdSequenceHandleRef = useRef(null);
  let fourthSequenceHandleRef = useRef(null);
  let fifthSequenceHandleRef = useRef(null);
  let sixthSequenceHandleRef = useRef(null);
  let seventhSequenceHandleRef = useRef(null);
  let eighthSequenceHandleRef = useRef(null);
  let ninthSequenceHandleRef = useRef(null);


  let bgCancelledRef = useRef(false);
  let panel6Fired = false;
  let panel10Fired = false;
  const [panel9FallDone, setPanel9FallDone] = useState(false);
  const [panel10Index, setPanel10Index] = useState(0);
  const [slideP10Index, setSlideP10Index] = useState(26);
  const [p11Index, setP11Index] = useState(0);
  const [sawIndex, setSawIndex] = useState(5);
  const [p13Index, setP13Index] = useState(9);
  const [p14Index, setP14Index] = useState(15);
  const [boardIndex, setBoardIndex] = useState(3);
  const [p16Index, setP16Index] = useState(8);
  const [p17Index, setP17Index] = useState(14);
  const [p18Index, setP18Index] = useState(19);
  const [p19Index, setP19Index] = useState(1);
  const [p20Index, setP20Index] = useState(0);
  const [p21Index, setP21Index] = useState(17);
  const [p24Index, setP24Index] = useState(1);
  const [p26Index, setP26Index] = useState(30);
  const [lastPanelIndex, setLastPanelIndex] = useState(4);
  const [lpPanteraIndex, setLpPanteraIndex] = useState(5);

  let isProgrammedScroll = false;
  let panel4Start = useRef(null);
  let extraHandleRef = useRef(null); 
  let [sawFlag, setSawFlag] = useState(false);
  const [actuallyReady, setActuallyReady] = useState(false);
  const actuallyReadyRef = useRef(false);

 

  const cancel = () => {
    bgCancelledRef.current = true;
    bgHandleRef.current?.release?.();
    cancelFirstSequence();
    cancelSecondSequence();
    cancelExtraSequence(); 
    cancelThirdSequence();
    cancelFourthSequence();
    cancelFifthSequence();
    cancelSixthSequence();
    cancelSeventhSequence();
    cancelEighthSequence();
    cancelNinthSequence();
  };
  const cancelFirstSequence = () => {
    if (!cancelledFirstSequenceRef.current) {
      cancelledFirstSequenceRef.current = true;
      setCancelledFirstSequence(true); // triggers re-render -> removes {!cancelled && (...) } from html and also removes the ScrollTrigger timelines associated!
    }
  };
  const cancelSecondSequence = () => {
    if (!cancelledSecondSequenceRef.current) {
      cancelledSecondSequenceRef.current = true;
      setCancelledSecondSequence(true); 
    }
  };
  const cancelExtraSequence = () => {
    if (!cancelledExtraSequenceRef.current) {
      cancelledExtraSequenceRef.current = true;
      setCancelledExtraSequence(true); 
    }
  };
  const cancelThirdSequence = () => {
    if (!cancelledThirdSequenceRef.current) {
      cancelledThirdSequenceRef.current = true;
      setCancelledThirdSequence(true); 
    }
  };
  const cancelFourthSequence = () => {
    if (!cancelledFourthSequenceRef.current) {
      cancelledFourthSequenceRef.current = true;
      setCancelledFourthSequence(true); 
    }
  };
  const cancelFifthSequence = () => { 
    if (!cancelledFifthSequenceRef.current) {
      cancelledFifthSequenceRef.current = true;
      setCancelledFifthSequence(true); 
    }
  };
  const cancelSixthSequence = () => { 
    if (!cancelledSixthSequenceRef.current) {
      cancelledSixthSequenceRef.current = true;
      setCancelledSixthSequence(true); 
    }
  };
  const cancelSeventhSequence = () => { 
    if (!cancelledSeventhSequenceRef.current) {
      cancelledSeventhSequenceRef.current = true;
      setCancelledSeventhSequence(true);
    }
  };
  const cancelEighthSequence = () => { 
    if (!cancelledEighthSequenceRef.current) {
      cancelledEighthSequenceRef.current = true;
      setCancelledEighthSequence(true); 
    }
  };
  const cancelNinthSequence = () => { 
    if (!cancelledNinthSequenceRef.current) {
      cancelledNinthSequenceRef.current = true;
      setCancelledNinthSequence(true); 
    }
  };

  useEffect(() => {
    if (ready && !cancelledFirstSequenceRef.current) return;
    const interval = setInterval(() => {
        setIndex((prev) => {
        const next = prev + 1;
        return next > 14 ? 12 : next; // loop 12 → 14
        });
    }, 300); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (actuallyReadyRef.current) return;

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
        if (startedPreloadRef.current) return; // prevent double preloading, this is for react 18 developer mode only. Could cause lag if it happens several times
        startedPreloadRef.current = true;

   (async () => {

       try {
        bgHandleRef.current = await preloadImages([...bgImages], {
          concurrency: 8,
          keepAlive: true,
          tolerateErrors: true,
          crossOrigin: "anonymous",
          revokeBlobURLsOnRelease: false,
        });
        if(bgCancelledRef.current) {
          bgHandleRef.current?.release?.();
          return;
        }
        firstSequenceHandleRef.current = await preloadImages([...firstSequence], {
           concurrency: 8,
           keepAlive: true,
           tolerateErrors: true,
           crossOrigin: "anonymous",
           revokeBlobURLsOnRelease: false,
           label: "page 2",
         });
         if (cancelledFirstSequenceRef.current) {
           firstSequenceHandleRef.current?.release?.();
           return;
         }
         
         secondSequenceHandleRef.current = await preloadImages([...secondSequence], {
           concurrency: 8,
           keepAlive: true,
           tolerateErrors: true,
           crossOrigin: "anonymous",
           revokeBlobURLsOnRelease: false,
           label: "page 3",
         });
         if (cancelledSecondSequenceRef.current) {
           secondSequenceHandleRef.current?.release?.();
           return;
         }
         // Preload extraSequence images - These were not expected, but had to be added for the sequence where the app scrolls up
         extraHandleRef.current = await preloadImages([...extraSequence], {
           concurrency: 8,
           keepAlive: true,
           tolerateErrors: true,
           crossOrigin: "anonymous",
           revokeBlobURLsOnRelease: false,
           label: "extra",
         });
         setReady(true);
         console.log("loaded all images page 3 and extra");
       } catch (err) {
         if (!cancelledFirstSequenceRef.current || !bgCancelledRef.current || !cancelledSecondSequenceRef.current) {
           console.error("preloadImages failed", err);
           //Sets Ready anyway. So far, this has never happened, and it usually loads all images. If one of the images doesn't load it's very likely to be a single frame of an animation
           //which is not critical for the initial load
           setReady(true);
         }
       }
     })();

     return () => {
       cancelFirstSequence();
       firstSequenceHandleRef.current?.release?.();
       firstSequenceHandleRef.current = null;

       cancelSecondSequence();
       secondSequenceHandleRef.current?.release?.();
       secondSequenceHandleRef.current = null;

       bgCancelledRef.current = true;
       bgHandleRef.current?.release?.();
       bgHandleRef.current = null;

       // Release extra images
       cancelExtraSequence(); // <-- Added
       extraHandleRef.current?.release?.();
       extraHandleRef.current = null;
     };

   }, []);
  
  // Lenis instance (gets initialized only after images are loaded)
  // because of the transitions from page to page, lenis and scrolltriggers need to be reset. They can only be started once page2 loads
  // otherwise it is very likely that the page will either exhibit strange behavior in the form of blinking, or freeze completely.
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

  const raf = (time) => {
    if (!lenisRef.current) return;
    lenisRef.current.raf(time);
    ScrollTrigger.update();
    rafIdRef.current = requestAnimationFrame(raf);
  };

  
  const handleScroll = ({ scroll }) => {
    if(isProgrammedScroll && !actuallyReadyRef.current) return;
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
    //console.log("waited for images, done!")
  );
  //console.log("going to try entering waitForDomImages");
  waitForDomImages.then(() => {
 
    //console.log("Going to refresh ScrollTrigger and request a frame:");
    //console.log("I am going to unblock scroll after that!");
    
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
      //console.log("refreshed ScrollTrigger!");
      setTimeout(() => {
        //console.log("Timeout of 3 seconds reached after unblocking scroll");
        //console.log("unblocked scroll");
        setActuallyReady(true);
        actuallyReadyRef.current = true;
        blockRef.current.up = false;
        blockRef.current.down = false;
      }, 2000);
      
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

useGSAP(() => {
  
    //console.log("not ready to start GSAP yet!")
    requestAnimationFrame(() => {
        //This one might not be needed, but testing showed that this provided somewhat of an improvement. It refreshes scrolltrigger before the timelines get activated and
        //requests an animation frame so the page updates
        //console.log("refreshing scroll trigger at the beginning!");
        ScrollTrigger.refresh(true);
    });
    if (!ready) {return}; // Ensure images are loaded before running GSAP
    //console.log("removed the block!")
    

    
        const narizp1n2 = gsap.utils.toArray('.panel2');
        const panterap3 = gsap.utils.toArray('.panel3');
        const narizp4 = gsap.utils.toArray('.panel4');
        const panterap5 = gsap.utils.toArray('.panel5');
        const panterap6 = gsap.utils.toArray('.panel6');
        const panel4Again = gsap.utils.toArray('.panel4Again');
        const extraSequence = gsap.utils.toArray('.extra');
        const panel7n8 = gsap.utils.toArray('.p7n8');
        const narizp9 = gsap.utils.toArray('.panel9');

        gsap.set([...narizp1n2, ...panterap3, ...panterap6, ...panel4Again, ...extraSequence, '.narizFall', ...narizp9], { autoAlpha: 0 });
        gsap.set('.pregos', { autoAlpha: 0 });
        const width = document.querySelector(".panel12").offsetWidth;

       
        const stepDuration = 1;
if(!cancelledFirstSequenceRef.current){
        var panel1n2 = gsap.timeline({
        scrollTrigger: {
            trigger: "#svgfundo",
            start: "top top",
            end: "+=800%",
            scrub: true,
            pin: true
        }
        });
        //These offsets are so the animation doesn't start as soon as we scroll into the panel/timeline
        const offsetP2 = 3;
        narizp1n2.forEach((frame, index) => {
        panel1n2.set(frame, { autoAlpha: 1 }, index * stepDuration + offsetP2);
        if(index>0){
            panel1n2.set(narizp1n2[index-1],{autoAlpha: 0}, index * stepDuration + offsetP2)
        }
        });
        panel1n2.to({},{}, offsetP2 + 3 + 2);

        var panel3 = gsap.timeline({
            scrollTrigger: {
            trigger: "#svgfundo",
            start: "top+=3.2%",
            end: "+=800%",
            scrub: true,
            pin: true,
            markers: true
            }
        });
        panterap3.forEach((frame, index) => {
        panel3.set(frame, { autoAlpha: 1 }, index * stepDuration + offsetP2);
        if(index>0){
            panel3.set(panterap3[index-1],{autoAlpha: 0}, index * stepDuration + offsetP2)
        }
        });
        panel3.to({},{}, offsetP2 + 3 + 2);

        var panel4 = gsap.timeline({
            scrollTrigger: {
            trigger: "#svgfundo",
            start: "top+=7.5%",
            end: "+=800%",
            scrub: true,
            pin: true,
            markers: true,
            onRefresh: function() {
                panel4Start.current = self.start;
            }
            }
        });
        for(let index=0; index<12; index++){
        panel4.set(narizp4[index%2], { autoAlpha: 1 }, index * stepDuration);
        if(index>0){
            panel4.set(narizp4[(index-1)%2],{autoAlpha: 0}, index * stepDuration)
        }
        };

        var panel5 = gsap.timeline({
            scrollTrigger: {
            trigger: "#svgfundo",
            start: "top+=27.75%",
            end: "+=800%",
            scrub: true,
            pin: true,
            markers: true
            }
        });
        for(let index=0; index<8; index++){
        panel5.set(panterap5[index%2], { autoAlpha: 1 }, index * stepDuration);
        if(index>0){
            panel5.set(panterap5[(index-1)%2],{autoAlpha: 0}, index * stepDuration)
        }
        };

       
        var panel6ScrollUp = gsap.timeline({
            paused: true
        }).set(extraSequence[0], { autoAlpha: 1 })
        .to(extraSequence, { y: "65%", duration: 1.5, ease: "power2.inOut" , transformOrigin:'top left'})
        .set(extraSequence[1], { autoAlpha: 1 }, 1.5)
        .set(extraSequence[2], { autoAlpha: 1 }, 1.5)
        .to(extraSequence[2], { y: 5, x: -800, duration: 1.5, ease: "power2.in" }, 1.52)
        .to(extraSequence, { y: "-65%", duration: 1.5, ease: "power2.inOut" }, 3.02)
        .set(extraSequence,{autoAlpha: 0}, ">")
        .eventCallback("onComplete", () => {
            cancelExtraSequence();
            extraHandleRef.current?.release?.();
            extraHandleRef.current = null;
            blockRef.current.down = false;
        });

        var panel6 = gsap.timeline({
    scrollTrigger: {
        trigger: "#svgfundo",
        start: "top+=32%",
        end: "+=800%",
        scrub: true,
        pin: true,
        markers: true,
        onUpdate: function(self) {
            if (!panel6Fired && self.progress >= 0.999) {
                panel6Fired = true;
                blockRef.current.up = true;
                blockRef.current.down = true;
                panel6.set('.pregos', { autoAlpha: 0 });
                panel6ScrollUp.play();
            }
        }
    }
})

        .set(panterap6[0], { autoAlpha: 1 })
        .set(panterap6[0], { autoAlpha: 0 }, 2);
        for(let index = 0; index < 6; index++){
            panel6.set(panterap6[index%2+1], { autoAlpha: 1 }, index * stepDuration+2);
            if(index>0){
            panel6.set(panterap6[(index-1)%2+1],{autoAlpha: 0}, index * stepDuration+2)
            }
        }
        panel6.set(panterap6[2], { autoAlpha: 0 }, 4+ 5*stepDuration)
        .set(panterap6[3], { autoAlpha: 1 }, 4+ 5*stepDuration)
        .set(panterap6[3], { autoAlpha: 0 }, 6+ 5*stepDuration);
        const offsetP6 = 6+5*stepDuration;
        for(let index = 0; index < 6; index++){
            panel6.set(panterap6[index%2+4], { autoAlpha: 1 }, index * stepDuration + offsetP6);
            if(index>0){
                panel6.set(panterap6[(index-1)%2+4],{autoAlpha: 0}, index * stepDuration + offsetP6);

            }
        }
        panel6.set(panterap6[5], {autoAlpha: 0}, 6+offsetP6);
        panel6.set(panterap6[6], {autoAlpha: 1}, 6+offsetP6);
        panel6.set('.pregos', { autoAlpha: 1 }, 6+offsetP6);
        panel6.to('.pregos', {x:500, duration: 1});
        panel6.set('.pregos', { autoAlpha: 0 },6.95+offsetP6);
}//firstSequence
if(!cancelledSecondSequenceRef.current){          
        var panel7 = gsap.timeline({
            scrollTrigger: {
                trigger: "#svgfundo",
                start: "top+=34%",
                end: "+=300%",
                pin: true,
                markers: true,
                onEnter: () => {
                    blockRef.current.up = true;
                    blockRef.current.down = true;
                    //cancelFirstSequence();
                    //firstSequenceHandleRef.current?.release?.();
                    //firstSequenceHandleRef.current = null; 

                    //Can only do that on the next panel's start.
                }
            }
        }).set('.narizFall',{autoAlpha: 1})
        .to('.narizFall', { y: 1500, duration: 1.5 })
        .to(panel7n8[0], { rotation: -40, duration: 0.5, transformOrigin:'center center', ease:"power2.out", repeat:1, yoyo:true},0.3)
        
        

        .to(panel7n8[1], { rotation:-40, y:-800, duration: 1 },0.3)
        .set('.narizFall', { autoAlpha: 0 })
        .set('.narizFall', { y: 0 })
        .set(panel7n8[1], { autoAlpha: 0 }, ">")
        .eventCallback("onComplete", () => {
            blockRef.current.down = false;
        });
        
      
        var panel9Fall = gsap.timeline({
          paused: true,
          onStart: async () => {
            cancelFirstSequence(); 
            firstSequenceHandleRef.current?.release?.(); 
            firstSequenceHandleRef.current = null; 
            panel9Fall.set(narizp9[0], { autoAlpha: 1 });
            thirdSequenceHandleRef.current = await preloadImages([...thirdSequence], {
              concurrency: 8,
              keepAlive: true,
              tolerateErrors: true,
              crossOrigin: "anonymous",
              revokeBlobURLsOnRelease: false,
              label: "page 3",
            })
          }
        })
        .set('.narizFall', { autoAlpha: 1, scale:0.7, x:300, zIndex:9 })
        .to('.narizFall', { y: 1400, duration: 0.5 })
        .set('.narizFall', { autoAlpha: 0 })
        .eventCallback("onComplete", () => {
          setTimeout(() => {
            blockRef.current.down = false; 
          }, 3000);
        });

        var panel9 = gsap.timeline({
            scrollTrigger: {
                trigger: "#svgfundo",
                start: "top+=38%",
                end: "+=800%",
                scrub:true,
                pin: true,
                markers: true,
                onEnter: () => {
                    blockRef.current.up = true;
                    blockRef.current.down = true;
                    panel9Fall.play();
                    
                }
            }
        })
          // Only set narizp9[0] to visible after panel9Fall is done
          // This part was clunky to get right, but it's good enough right now
          for(let i = 0; i < narizp9.length; i++){
            panel9.set(narizp9[i], { autoAlpha: 0 }, i*stepDuration);
            // Only set autoAlpha: 1 for narizp9[1] and onwards
            if(i > 0){
              panel9.set(narizp9[i], { autoAlpha: 1 }, i*stepDuration);
              panel9.set(narizp9[i-1], { autoAlpha: 0 }, i*stepDuration);
            }
          }
          panel9.to({},{}, narizp9.length * stepDuration + 2);
}///Second Sequence
if(!cancelledThirdSequenceRef.current){
        //This is an array which stores the index and duration intended for each step of panel10.
          const panel10Sequence = [
            { index: 0, duration: stepDuration },           // Show 0 for 1 step
            { index: 1, duration: 2 * stepDuration },       // Show 1 for 2 steps
            ...[2,3,4,5].map(i => ({ index: i, duration: stepDuration })), // 1 step each for 2-5
          ];

          // Loop 6-9 six times (nariz and pantera hammering the nail)
          for (let loop = 0; loop < 6; loop++) {
            if(loop === 5){
              [6,7].forEach(i => {
                panel10Sequence.push({ index: i, duration: stepDuration });
              });
            }else{
              [6,7,8,9].forEach(i => {
                panel10Sequence.push({ index: i, duration: stepDuration });
              });
            }
            
          }

          // 1 step each for 10-25 (store it in the array)
          for (let i = 10; i <= 25; i++) {
            panel10Sequence.push({ index: i, duration: stepDuration });
          }

          // Make sure it's off-screen before anything happens
          gsap.set('.panel10Frame', { x: '-100%' });

          var panel10 = gsap.timeline({
            scrollTrigger: {
              trigger: "#svgfundo",
              start: "top+=43.5%",
              end: "+=2400%",
              scrub: true,
              pin: true,
              markers: true,
              onEnter: () => { blockRef.current.up = true; 
                cancelSecondSequence(); 
                secondSequenceHandleRef.current?.release?.();
                secondSequenceHandleRef.current = null;
                
              },
              onStart: async () => {
                fourthSequenceHandleRef.current = await preloadImages([...fourthSequence], {
                  concurrency: 8,
                  keepAlive: true,
                  tolerateErrors: true,
                  crossOrigin: "anonymous",
                  revokeBlobURLsOnRelease: false,
                  label: "fourth sequence",
                })
              },
              onUpdate: function (self) {
                if (!panel10Fired && self.progress >= 0.999) {
                  panel10Fired = true;
                  blockRef.current.up = true;
                  blockRef.current.down = true;
                  panel10Slide.restart(); // restart to play the whole thing
                }
              }
              }
            });

          panel10Sequence.forEach(({ index, duration }) => {
            panel10.to({}, {
              duration,
              onStart: () => setPanel10Index(index)
            });
          });

          var panel10Slide = gsap.timeline({ paused: true });

            //Frame slides in
            panel10Slide.to('.panel10Frame', {
              x: '0',
              duration: 1,
              ease: 'power2.out',
              onComplete: () => console.log("Slid panel10!!")
            });

            //go through frame 26-31
            for (let i = 26; i <= 31; i++) {
              panel10Slide.to({}, {
                duration: stepDuration/2,
                onStart: () => setSlideP10Index(i)
              }, ">"); 
            }
            panel10Slide.eventCallback("onComplete", () => {
              console.log("Completed panel10Slide!");
              blockRef.current.down = false;
            });
}

if(!cancelledFourthSequenceRef.current){
           if(!sawFlag){
              gsap.to(".panel12", {
                xPercent: -100,
                repeat: -1,
                duration: 1,
                ease: "none",
                modifiers: {
                  xPercent: gsap.utils.wrap(-100, 0) //wrap around, doesn't stop
                }
              });
            }
            

            var panel11 = gsap.timeline({
              scrollTrigger: {
                trigger: "#svgfundo",
                start: "top+=48.2%",
                end: "+=800%",
                scrub: true,
                pin: true,
                markers: true,
                  onEnter: () => {
                    blockRef.current.up = false;
                    cancelThirdSequence();
                    thirdSequenceHandleRef.current?.release?.();
                    thirdSequenceHandleRef.current = null;
                    
                  },
                  onLeaveBack: () => {
                    blockRef.current.up = true;
                  }
                },
                
            });
            fourthSequence.slice(0, 4).forEach((frame, index) => {
              panel11.to({}, {
                duration: stepDuration,
                onStart: () => setP11Index(index)
              });
            });
            var panel12 = gsap.timeline({
              scrollTrigger: {
                trigger: "#svgfundo",
                start: "top+=50%",
                end: "+=400%",
                pin: true,
                markers:true,
                onEnter: async () => {
                  fifthSequenceHandleRef.current = await preloadImages([...fifthSequence], {
                    concurrency:8,
                    keepAlive: true,
                    tolerateErrors: true,
                    crossOrigin: "anonymous",
                    revokeBlobURLsOnRelease: false,
                    label: "fifth sequence",
                  });
                }
              }
            });
            var panel13 = gsap.timeline({ //And 14!
              scrollTrigger: {
                trigger: "#svgfundo",
                start: "top+=52.8%",
                end: "+=800%",
                pin: true,
                scrub: true,
                markers:true,
                onEnter: () => {
                  gsap.set('.panel13', { autoAlpha: 1 });
                },
                onLeaveBack: () => {
                  gsap.set('.panel13', { autoAlpha: 0 });
                },
                onUpdate: self => {
                  
                  if(self.progress < 0.999){

                    // get progress!
                    const progress = self.progress;
                    const minIndex = 9;
                    const maxIndex = 22;
                    //Basically we are subtracting the end frame and the beginning frame and adding 1 to get the number of frames
                    //This means: 14-9+1, which equals 6. We then multiply it by the progress of the scrollTrigger (a number from 0 to 1)
                    //Which will give a value between 0 and 6. Math.floor rounds it to the nearest full number so we get steps :D
                    const preCalc = Math.floor(progress * (maxIndex - minIndex + 1)) + minIndex; 
                    const index = Math.max(minIndex, Math.min(preCalc, maxIndex));
                    //I was getting an error when scrolling past the scrolltrigger which was changing the image to the next one
                    //so Math.max should ensure that we don't go below the minimum or above the maximum index
                    if(index <= 14) setP13Index(index);
                    if(index > 14) setP14Index(index);
                  }
                }
              }
            });

   
}///FourthSequence

if(!cancelledFifthSequenceRef.current){
            

            var panel15 = gsap.timeline({
              scrollTrigger: {
                trigger: "#svgfundo",
                start: "top+=56.7%",
                end: "+=100%",
                pin: true,
                markers:true,
                onEnter: () => {
                  blockRef.current.up = true;
                  blockRef.current.down = true;
                },
              }
            }).set('.panel15.narizCai', { autoAlpha: 1},0.1)
            .set('.panel15.laminaCai', { autoAlpha: 1},0.1)
            .to('.panel15.narizCai', { y:500, duration: 0.3},">")
            .to('.panel15.laminaCai', { y:850, duration: 0.3}, "<")
            .set('.panel15.narizCai', { autoAlpha: 0 },">")
            .set('.panel15.laminaCai', { autoAlpha: 0 },"<")
            for(let i = 5; i <=7;i++){
              panel15.to({}, {
                duration:0.3,
                onStart: () => setBoardIndex(i)
              })
            }
            panel15.eventCallback("onComplete", () => {
              console.log("complete");
              blockRef.current.down = false;
            });

            var panel16 = gsap.timeline({ //Panel 16 and 17
              scrollTrigger: {
                trigger: "#svgfundo",
                start: "top+=61%",
                end: "+=100%",
                scrub:false,
                pin: true,
                markers:true,
                onEnter: () => {
                  blockRef.current.up = true;
                  blockRef.current.down = true;
                },
                onStart: async () => {
                  sixthSequenceHandleRef.current = await preloadImages([...sixthSequence], {
                    concurrency:8,
                    keepAlive: true,
                    tolerateErrors: true,
                    crossOrigin: "anonymous",
                    revokeBlobURLsOnRelease: false,
                    label: "sixth sequence",
                  });}
              }
            })
            for(let i = 8; i < 23; i++){
              panel16.to({},{
                duration:0.2,
                onStart: () => {
                  if(i<14)  setP16Index(i);
                  else if(i>= 19){
                    setP17Index(i-5);
                  }
                }
              })
            };
            panel16.eventCallback("onComplete", () => {
              console.log("complete p16");
              blockRef.current.down = false;
            });




            var panel18Fall = gsap.timeline({
              paused: true,
            }).to('.p18narizCai', { y: 500, duration: 0.5 })
            .set('.p18narizCai', { autoAlpha: 0 },">")
            .set('.panel18', { autoAlpha: 1 },"<")
            .eventCallback("onComplete", () => {
              console.log("complete p18Fall");
              blockRef.current.up = false;
              blockRef.current.down = false;
            });

            var panel18 = gsap.timeline({ 
              scrollTrigger: {
                trigger: "#svgfundo",
                start: "top+=63.5%",
                end: "+=600%",
                scrub:false,
                pin: true,
                markers:true,
                onEnter: () => {
                  blockRef.current.up = true;
                  blockRef.current.down = true;
                  panel18Fall.play();
                },
                onUpdate: self => {
                   
                  if(self.progress < 0.999){
                    
                    const progress = self.progress;
                    const minIndex = 19;
                    const maxIndex = 31;
                    
                    const preCalc = Math.floor(progress * (maxIndex - minIndex + 1)) + minIndex; 
                    const index = Math.max(minIndex, Math.min(preCalc, maxIndex));
                    if(index === 1) blockRef.current.up = true;
                  
                    setP18Index(index);
                   
                  }
                }
              }
            })
}//FifthSequence
if(!cancelledSixthSequenceRef.current){

            

            var panel19 = gsap.timeline({
              scrollTrigger: {
                trigger: "#svgfundo",
                start: "top+=67%",
                end: "+=600%",
                scrub:true,
                pin: true,
                markers:true,
                onEnter: () => {
                  blockRef.current.up = false;
                  blockRef.current.down = false;
                  fifthSequenceHandleRef.current?.release?.();
                  fifthSequenceHandleRef.current = null;
                  cancelFifthSequence();
                  setTimeout(async () => {
                    if(seventhSequenceHandleRef.current!=null) return;
                    seventhSequenceHandleRef.current = await preloadImages([...seventhSequence], {
                      concurrency:8,
                      keepAlive: true,
                      tolerateErrors: true,
                      crossOrigin: "anonymous",
                      revokeBlobURLsOnRelease: false,
                      label: "seventh sequence",
                    })
                  },1000);
                  
                },
                onLeaveBack: () => {
                  blockRef.current.up = true;
                  
                },
                onLeave: () => {
                  gsap.set('.panel19', {autoAlpha:0});
                },
                onEnterBack: () => {
                  gsap.set('.panel19', {autoAlpha:1});
                },
                onUpdate: self => {
                  
                  if(self.progress < 0.999){

                    const progress = self.progress;
                    const minIndex = 1;
                    const maxIndex = 28;
                    
                    const preCalc = Math.floor(progress * (maxIndex - minIndex + 1)) + minIndex;
                    const index = Math.max(minIndex, Math.min(preCalc, maxIndex));
                    
                    setP19Index(index);

                  }
                }
              }
            })
            
}//SixthSequence

if(!cancelledSeventhSequence.current){
                var panel20 = gsap.timeline({
                  scrollTrigger: {
                    trigger: "#svgfundo",
                    start: "top+=71%",
                    end: "+=600%",
                    scrub:true,
                    pin: true,
                    markers:true,
                    onEnter: () => {
                      gsap.set('.panel20', {autoAlpha:1});
                      blockRef.current.up = false;
                      blockRef.current.down = false;

                      sixthSequenceHandleRef.current?.release?.();
                      sixthSequenceHandleRef.current = null;
                      cancelSixthSequence();

                      setTimeout(async () => {
                        if(eighthSequenceHandleRef.current!=null) return;
                        eighthSequenceHandleRef.current = await preloadImages([...eighthSequence], {
                        concurrency:8,
                        keepAlive: true,
                        tolerateErrors: true,
                        crossOrigin: "anonymous",
                        revokeBlobURLsOnRelease: false,
                        label: "eighth sequence",
                        })
                      },1000);
                      
                    },
                    onLeave: () => {
                      gsap.set('.panel20', {autoAlpha:0});
                    },
                    onLeaveBack: () => {
                      blockRef.current.up = true;

                    },
                    onEnterBack: () => {
                      gsap.set('.panel20', {autoAlpha:1});
                    },
                    onUpdate: self => {
                      // Calculate progress and map to index
                      if(self.progress < 0.999){

                        const progress = self.progress;
                        const minIndex = 0;
                        const maxIndex = 16;
                        
                        const preCalc = Math.floor(progress * (maxIndex - minIndex + 1)) + minIndex;
                        const index = Math.max(minIndex, Math.min(preCalc, maxIndex));
                        
                        setP20Index(index);

                      }
                    }
                  }
                })
                var panel21 = gsap.timeline({
                  scrollTrigger: {
                    trigger: "#svgfundo",
                    start: "top+=74%",
                    end: "+=1600%",
                    scrub:true,
                    pin: true,
                    markers:true,
                  }
                }).set(['.panel21pSlide', '.panel21nSlide'], {x:-900})
                .to('.panel21pSlide', {x:0, duration:2})
                .to({}, {
                  duration: 0.01,
                  onStart: () => setP21Index(18),             
                  onReverseComplete: () => setP21Index(17)    
                }, ">")
                .to({}, {
                  duration: 0.01,
                  onStart: () => setP21Index(19),             
                  onReverseComplete: () => setP21Index(18)    
                }, ">1")
                .to({}, {
                  duration: 0.01,
                  onStart: () => setP21Index(20),             
                  onReverseComplete: () => setP21Index(19)    
                }, ">1")
                .set('.panel21pSlide',{autoAlpha:0},">0.5")
                .set('.panel21pSlide',{x:-900},"<0.1")
                
                .to({}, {
                  duration: 0.01,
                  onStart: () => setP21Index(21),             
                  onReverseComplete: () => setP21Index(20)    
                }, ">")
                .to('.panel21pSlide', {x:0, duration:2},">")
                .set('.panel21pSlide',{autoAlpha:1},"<0.1")
                .to({}, {
                  duration: 0.01,
                  onStart: () => setP21Index(22),             
                  onReverseComplete: () => setP21Index(21)    
                }, ">1")
                for(let i = 23; i <= 30; i++){
                  if(i===23){
                    panel21.to({}, {
                    duration:0.2,
                    onStart: () => setP21Index(i),
                    onReverseComplete: () => setP21Index(i-1)
                  },"<3")
                } else{
                  panel21.to({}, {
                    duration:0.2,
                    onStart: () => setP21Index(i),
                    onReverseComplete: () => setP21Index(i-1)
                  },"<0.5")
                  }
                }
                panel21.to({}, {
                  duration: 0.01,
                  onStart: () => setP21Index(31),             
                  onReverseComplete: () => setP21Index(30)    
                }, ">1")
                panel21.set('.panel21pSlide',{autoAlpha:0},"<")
                
                .set('.panel21pSlide', {autoAlpha:1},">3")
                for(let i = 31; i<=39; i++){
                  if(i===31){
                    panel21.to({}, {
                      duration:0.2,
                      onStart: () => setP21Index(i),
                      onReverseComplete: () => setP21Index(i-1)
                    },"<")
                  }else {
                    panel21.to({}, {
                      duration:0.2,
                      onStart: () => setP21Index(i),
                      onReverseComplete: () => setP21Index(i-1)
                    },"<0.5")
                  }
                  
                }
                panel21.to({},{x:0.01, duration:0.01},">3")
}//SeventhSequence
if(!cancelledEighthSequenceRef.current){
                  var panel22 = gsap.timeline({
                      scrollTrigger: {
                        trigger: "#svgfundo",
                        start: "top+=77%",
                        end: "+=500%",
                        scrub:false,
                        pin: true,
                        markers:true,
                      },
                      onLeaveBack: () => {
                        blockRef.current.up = true; 
                      },
                      onEnter: () => {
                        blockRef.current.up = false;
                        blockRef.current.up = false;
                      }
                    })
                  var panel24 = gsap.timeline({
                      scrollTrigger: {
                        trigger: "#svgfundo",
                        start: "top+=80%",
                        end: "+=500%",
                        scrub:true,
                        pin: true,
                        markers:true,
                        onEnter: () => {
                          if(seventhSequenceHandleRef.current != null){
                            cancelSeventhSequence();
                            seventhSequenceHandleRef.current?.release?.();
                            seventhSequenceHandleRef.current = null;
                          }
                        },
                        onUpdate: self => {
                          
                          if(self.progress < 0.999){

                            const progress = self.progress;
                            const minIndex = 1;
                            const maxIndex = 26;
                            
                            const preCalc = Math.floor(progress * (maxIndex - minIndex + 1)) + minIndex;
                            const index = Math.max(minIndex, Math.min(preCalc, maxIndex));
                            
                            setP24Index(index);

                          }
                        }
                      }
                  })
                  var panel25 = gsap.timeline({
                    scrollTrigger: {
                      trigger: "#svgfundo",
                      start: "top+=83.85%",
                      end: "+=500%",
                      scrub:true,
                      pin: true,
                      markers:true,
                      onEnter: async () => {
                      ninthSequenceHandleRef.current = await preloadImages([...ninthSequence],{
                        concurrency:8,
                        keepAlive: true,
                        tolerateErrors: true,
                        crossOrigin: "anonymous",
                        revokeBlobURLsOnRelease: false,
                        label: "ninth sequence",
                        
                      })
                      }
                      
                    }
                  })
                  .to('.panel25.pupila', { x:"0.9%", duration:1 })
                  .to('.panel25.pupila', { x:"-0.8%", duration:2 })
                  .to('.panel25.pupila', { x:"0.9%", duration:1 })
                  .to('.panel25.pupila', { x:"-0.8%", duration:2 });   

                  var panel26 = gsap.timeline({
                    scrollTrigger: {
                      trigger: "#svgfundo",
                      start: "top+=87%",
                      end: "+=1800%",
                      scrub:true,
                      pin: true,
                      markers:true,
                      onUpdate: self => {
                        const progress = self.progress;
                        if(progress <= 0.5){
                          const minIndex = 0;
                          const maxIndex = 9;
                          
                          const preCalc = Math.floor(progress*2 * (maxIndex - minIndex + 1)) + minIndex;
                          const index = Math.max(minIndex, Math.min(preCalc, maxIndex));

                          setP26Index((index%2)+30);
                        }
                        
                      }
                    }
                  })
                  .set('.panel26', { x:"700"})
                  .to('.panel26', {x:"-800", duration: 10})
                  .to('.panel27', {y:-80, scale:0.2, duration: 8},">")
                  .set('.panel27', {autoAlpha:0},">")
                  .to({},{duration:0.01,x:0.01},">2")

}
if(!cancelledNinthSequenceRef.current){

                  var panel28 = gsap.timeline({ //And 29, but it doesn't move
                    scrollTrigger: {
                      trigger: "#svgfundo",
                      start: "top+=90%",
                      end: "+=800%",
                      scrub:true,
                      pin: true,
                      markers:true,
                      onLeaveBack: () => {
                        blockRef.current.up = true;
                      },
                      onEnter: () => {
                        blockRef.current.up = false;
                        cancelEighthSequence();
                        eighthSequenceHandleRef.current?.release?.();
                        eighthSequenceHandleRef.current = null;
                      }
                    }
                  }).to('.panel28.pantera', {y:"-60%", duration:5});

                  var panel30 = gsap.timeline({
                    scrollTrigger: {
                      trigger: "#svgfundo",
                      start: "top+=95%",
                      end: "+=1200%",
                      scrub:true,
                      pin: true,
                      markers:true,
                      onEnter: () => {
                      gsap.set('.panel30.pantera', {autoAlpha:1});
                    },
                    onUpdate: self => {
                      const progress = self.progress;
                      if(progress <= 0.999){
                        
                          const minIndex = 4;
                          const maxIndex = 17;

                          const preCalc = Math.floor(progress * (maxIndex - minIndex + 1)) + minIndex;
                          const index = Math.max(minIndex, Math.min(preCalc, maxIndex));
                          console.log(index);
                        if(index > 4){
                          if(index <= 12) setLpPanteraIndex(index);
                          else{
                            if(index === 13){
                              gsap.set('.panel30.pantera', {autoAlpha:0});
                            }
                            setLastPanelIndex(index);
                          } 
                        
                        }
                        
                      }

                    },
                    onLeave: () => {
                      blockRef.current.up = true;
                      blockRef.current.down = true;
                      gsap.to('.theEnd', {autoAlpha:1, duration: 5});
                    }
                    },
                    
                  })

}
    requestAnimationFrame(() => {
        console.log("refreshing scroll trigger at the end!");
        ScrollTrigger.refresh(true);
    });
  }, { scope: mainRef, dependencies: [ready] });

useEffect(() => {
  if (!ready && cancelledFourthSequence.current) return;
  
  const sawAnim = gsap.timeline({ repeat: -1 });
  for(let i = 0; i < 12; i++) {
    sawAnim.to({}, {
      duration: 0.25,
      onStart: () => setSawIndex(i % 4 + 5)
    });
  }
  return () => sawAnim.kill();
}, [ready, cancelledFourthSequenceRef]);
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
        <img src={bgImages[0]} className="background" decoding="async" loading="eager"  style={{ position:'relative', top:'0', left:'0',width: '100%', minHeight:'100vh', height: 'auto' , zIndex: '0', visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[1]} className="paineis" decoding="async" loading="eager" style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '6', visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[2]} className="p4Frame" decoding="async" loading="eager" style={{ position:'absolute', top:'0', left:'0',width: '100%', height: 'auto' , zIndex: '7', visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[3]} className="p5n6cover" decoding="async" loading="eager" style={{ position:'absolute', top:'32.5%', left:'0',width: '49%', height: 'auto' , zIndex: '5', visibility:'visible'}} /> {/* blue background */}
        <img src={bgImages[5]} className="p26cover" decoding="async" loading="eager" style={{ position:'absolute', top:'88.52%', right:'0', width:'50%', height:'auto', zIndex:'3', opacity:'1', visibility:'visible' }} />

{!cancelledExtraSequence &&(
    <>
        <img src={extraSequence[0]} className="extra" style={{position: "absolute", top: "0", left: "0", width: "100%", height: "auto", zIndex: "9", visibility: "visible"}}/>
        <img src={extraSequence[1]} className="extra" style={{position: "absolute", top: "0", left: "0", width: "100%", height: "auto", zIndex: "10", visibility: "visible"}}/>
        <img src={extraSequence[2]} className="extra" style={{position: "absolute", top: "0", left: "0", width: "100%", height: "auto", zIndex: "11", visibility: "visible"}}/>
    </>
)}
{!cancelledFirstSequence && (
    <div id ="firstSequence">
        <img src={firstSequence[0]} className="panel2" decoding="async" loading="eager" style={{ position:'absolute', top:'0', right:'0',width: '49%', height: 'auto' , zIndex: '4', visibility:'visible'}} />
        <img src={firstSequence[1]} className="panel2" decoding="async" loading="eager" style={{ position:'absolute', top:'0', right:'0',width: '49%', height: 'auto' , zIndex: '4', visibility:'visible'}} />
        <img src={firstSequence[2]} className="panel2" decoding="async" loading="eager" style={{ position:'absolute', top:'0', right:'0',width: '49%', height: 'auto' , zIndex: '4', visibility:'visible'}} />
        
        <img src={firstSequence[3]} className="panel3" decoding="async" loading="eager" style={{ position:'absolute', top:'3.17%', left:'0',width: '100%', height: 'auto' , zIndex: '7', visibility:'visible'}} />
        <img src={firstSequence[4]} className="panel3" decoding="async" loading="eager" style={{ position:'absolute', top:'3.17%', left:'0',width: '100%', height: 'auto' , zIndex: '7', visibility:'visible'}} />
        <img src={firstSequence[5]} className="panel3" decoding="async" loading="eager" style={{ position:'absolute', top:'3.17%', left:'0',width: '100%', height: 'auto' , zIndex: '7', visibility:'visible'}} />
        <img src={firstSequence[6]} className="panel3" decoding="async" loading="eager" style={{ position:'absolute', top:'3.17%', left:'0',width: '100%', height: 'auto' , zIndex: '7', visibility:'visible'}} />
        <img src={firstSequence[7]} className="panel3" decoding="async" loading="eager" style={{ position:'absolute', top:'3.17%', left:'0',width: '100%', height: 'auto' , zIndex: '7', visibility:'visible'}} />
        <img src={firstSequence[8]} className="panel3" decoding="async" loading="eager" style={{ position:'absolute', top:'3.17%', left:'0',width: '100%', height: 'auto' , zIndex: '7', visibility:'visible'}} />
        <img src={firstSequence[9]} className="panel3" decoding="async" loading="eager" style={{ position:'absolute', top:'3.17%', left:'0',width: '100%', height: 'auto' , zIndex: '7', visibility:'visible'}} />
        
        <img src={firstSequence[10]} className="panel4" decoding="async" loading="eager" style={{ position:'absolute', top:'9.55%', left:'0',width: '35%', height: 'auto' , zIndex: '5 ', opacity:1, visibility:'visible'}} />
        <img src={firstSequence[11]} className="panel4" decoding="async" loading="eager" style={{ position:'absolute', top:'9.55%', left:'0',width: '35%', height: 'auto' , zIndex: '5 ',opacity:0, visibility:'visible'}} />
        
        <img src={firstSequence[index]} className="dust4to5" style={{position: "absolute", top: "11.48%", left: "0", width: "23%", height: "auto", zIndex: "9", visibility: "visible"}}/>
       
        <img src={firstSequence[15]} className="panel5" decoding="async" loading="eager" style={{ position:'absolute', top:'28.3%', left:'0',width: '32.3%', height: 'auto' , zIndex: '4', opacity: 1, visibility:'visible'}} />
        <img src={firstSequence[16]} className="panel5" decoding="async" loading="eager" style={{ position:'absolute', top:'28.3%', left:'0',width: '32.3%', height: 'auto' , zIndex: '4', opacity: 0, visibility:'visible'}} />

        <img src={firstSequence[17]} className="panel6" decoding="async" loading="eager" style={{ position:'absolute', top:'33.3%', left:'1%',width: '48%', height: 'auto' , zIndex: '5', opacity: 1, visibility:'visible'}} />
        <img src={firstSequence[18]} className="panel6" decoding="async" loading="eager" style={{ position:'absolute', top:'33.3%', left:'1%',width: '48%', height: 'auto' , zIndex: '5', opacity: 0, visibility:'visible'}} />
        <img src={firstSequence[19]} className="panel6" decoding="async" loading="eager" style={{ position:'absolute', top:'33.3%', left:'1%',width: '48%', height: 'auto' , zIndex: '5', opacity: 0, visibility:'visible'}} />
        <img src={firstSequence[20]} className="panel6" decoding="async" loading="eager" style={{ position:'absolute', top:'33.3%', left:'1%',width: '48%', height: 'auto' , zIndex: '5', opacity: 0, visibility:'visible'}} />
        <img src={firstSequence[21]} className="panel6" decoding="async" loading="eager" style={{ position:'absolute', top:'33.3%', left:'1%',width: '48%', height: 'auto' , zIndex: '5', opacity: 0, visibility:'visible'}} />
        <img src={firstSequence[22]} className="panel6" decoding="async" loading="eager" style={{ position:'absolute', top:'33.3%', left:'1%',width: '48%', height: 'auto' , zIndex: '5', opacity: 0, visibility:'visible'}} />
        <img src={firstSequence[23]} className="panel6" decoding="async" loading="eager" style={{ position:'absolute', top:'33.4%', left:'0.7%',width: '48%', height: 'auto' , zIndex: '5', opacity: 0, visibility:'visible'}} />
        
        <img src={firstSequence[24]} className="pregos" decoding="async" loading="eager" style={{ position:'absolute', top:'34%', left:'48%',width: '8%', height: 'auto' , zIndex: '9', visibility:'visible'}} />

    </div>)}
{!cancelledSecondSequence && (<>
      <div id ="secondSequence">
        <img src={secondSequence[0]} className="narizFall" decoding="async" loading="eager" style={{ position:'absolute', top:'33%', left:'20%', width:'27%', height:'auto', zIndex:'4', visibility:'visible' }} />
        <img src={secondSequence[6]} className="p7n8" decoding="async" loading="eager" style={{ position:'absolute', top:'36.26%', left:'0%', width:'75%', height:'auto', zIndex:'3', visibility:'visible' }} />
        <img src={secondSequence[7]} className="p7n8" decoding="async" loading="eager" style={{ position:'absolute', top:'36.26%', left:'0%', width:'75%', height:'auto', zIndex:'3', visibility:'visible' }} />

        <img src={secondSequence[1]} className="panel9" decoding="async" loading="eager" style={{ position:'absolute', top:'40%', left:'35%', width:'30%', height:'auto', zIndex:'5', visibility:'visible' }} />
        <img src={secondSequence[2]} className="panel9" decoding="async" loading="eager" style={{ position:'absolute', top:'40%', left:'35%', width:'30%', height:'auto', zIndex:'5', visibility:'visible' }} />
        <img src={secondSequence[3]} className="panel9" decoding="async" loading="eager" style={{ position:'absolute', top:'40%', left:'35%', width:'30%', height:'auto', zIndex:'5', visibility:'visible' }} />
        <img src={secondSequence[4]} className="panel9" decoding="async" loading="eager" style={{ position:'absolute', top:'40%', left:'35%', width:'30%', height:'auto', zIndex:'5', visibility:'visible' }} />
        <img src={secondSequence[5]} className="panel9" decoding="async" loading="eager" style={{ position:'absolute', top:'40%', left:'35%', width:'30%', height:'auto', zIndex:'5', visibility:'visible' }} />
      </div>
</>)}
{!cancelledThirdSequence && (<>
      <div id ="thirdSequence">
        <img src={thirdSequence[panel10Index]} className="panel10" decoding="async" loading="eager" style={{ position:'absolute', top:'43.3%', left:'0%', width:'81.7%', height:'auto', zIndex:'9', visibility:'visible' }} />
        <img src={thirdSequence[slideP10Index]} className="panel10Frame" decoding="async" loading="eager" style={{ position:'absolute', top:'43.3%', left:'0%', width:'81.7%', height:'auto', zIndex:'10', visibility:'visible' }} />
      </div>
</>)}
{!cancelledFourthSequence && (<>
      <div id ="fourthSequence">
        <img src={fourthSequence[p11Index]} className="panel11" decoding="async" loading="eager" style={{ position:'absolute', top:'48.8%', left:'-1.32%', width:'77%', height:'auto', zIndex:'11', visibility:'visible' }} />
        {/*Loop the planks! */}
        <div className="panel12Container" style={{ display: 'flex', overflow: 'hidden', position: 'absolute', top:'51.1%', left:'0', zIndex: '3' }}>
          <img src={fourthSequence[4]} className="panel12" style={{flexShrink: '0', width:'100%', height:'auto'}} />
          <img src={fourthSequence[4]} className="panel12" style={{flexShrink: '0', width:'100%', height:'auto'}} />
        </div>
        <img src={fourthSequence[sawIndex]} className="panel12saw" decoding="async" loading="eager" style={{ position:'absolute', top:'51.5%', left:'15%', width:'45%', height:'auto', zIndex:'4', visibility:'visible' }} />
        <img src={fourthSequence[p13Index]} className="panel13" decoding="async" loading="eager" style={{ position:'absolute', top:'53.38%', left:'9.2%', width:'41%', height:'auto', zIndex:'4', opacity: 0, visibility:'visible' }} />

        <img src={fourthSequence[p14Index]} className="panel14" decoding="async" loading="eager" style={{ position:'absolute', top:'52.6%', left:'52%', width:'30%', height:'auto', zIndex:'2', opacity: 1, visibility:'visible' }} />

</div>
</>)}
{!cancelledFifthSequence && (<>
      <div id ="fifthSequence">
        <img src = {fifthSequence[0]} className="ladderFrame" decoding="async" loading="eager" style={{ position:'absolute', top:'56.52%', left:'0%', width:'100%', height:'auto', zIndex:'12', visibility:'visible' }} />
        <img src = {fifthSequence[1]} className="panel15 narizCai" decoding="async" loading="eager" style={{ position:'absolute', top:'55%', left:'60%', width:'25%', height:'auto', zIndex:'11',opacity:0, visibility:'visible' }} />
        <img src = {fifthSequence[2]} className="panel15 laminaCai" decoding="async" loading="eager" style={{ position:'absolute', top:'55%', left:'25%', width:'15%', height:'auto', zIndex:'10',opacity:0, visibility:'visible' }} />
        <img src = {fifthSequence[boardIndex]} className="panel15" decoding="async" loading="eager" style={{ position:'absolute', top:'56.80%', left:'0%', width:'100%', height:'auto', zIndex:'9',  visibility:'visible' }} />

        <img src = {fifthSequence[p16Index]} className="panel16" decoding="async" loading="eager" style={{ position:'absolute', top:'61.6%', left:'0%', width:'50%', height:'auto', zIndex:'4',  visibility:'visible' }} />
        <img src = {fifthSequence[p17Index]} className="panel17" decoding="async" loading="eager" style={{ position:'absolute', top:'61.4%', right:'0%', width:'48.6%', height:'auto', zIndex:'4',  visibility:'visible' }} />

        <img src = {bgImages[4]} className="panel16n17bgcover" decoding="async" loading="eager" style={{ position:'absolute', top:'61.5%', left:'0%', width:'100%', height:'auto', zIndex:'3',  visibility:'visible' }} />
        <img src = {fifthSequence[18]} className="p18narizCai" decoding="async" loading="eager" style={{ position:'absolute', top:'63%', left: '40%', width:'20%', height:'auto', zIndex:'2',  visibility:'visible' }} />
        <img src = {fifthSequence[p18Index]} className="panel18" decoding="async" loading="eager" style={{ position:'absolute', top:'65.6%', left:'0', width:'100%', height:'auto', zIndex:'4', opacity:'0', visibility:'visible' }} />

      </div>
</>)}

{!cancelledSixthSequence && (<>

        <img src = {sixthSequence[p19Index]} className="panel19" decoding="async" loading="eager" style={{ position:'absolute', top:'68%', left:'0', width:'100%', height:'auto', zIndex:'9', opacity:'1', visibility:'visible' }} />

</>)}
{!cancelledSeventhSequence && (<>
        <img src = {seventhSequence[p20Index]} className="panel20" decoding="async" loading="eager" style={{ position:'absolute', top:'72%', left:'0', width:'100%', height:'auto', zIndex:'4', opacity:'0', visibility:'visible' }} />
        
        <img src = {seventhSequence[p21Index]} className="panel21pSlide" decoding="async" loading="eager" style={{ position:'absolute', top:'75.46%', left:'0', width:'100%', height:'auto', zIndex:'4', opacity:'1', visibility:'visible' }} />
</>)}

{!cancelledEighthSequence && (<>
      <img src={eighthSequence[0]} className="panel22" decoding="async" loading="eager" style={{ position:'absolute', top:'78.2%', left:'4%', width:'50%', height:'auto', zIndex:'4', opacity:'1', visibility:'visible' }} />
      <img src={eighthSequence[p24Index]} className="panel24" decoding="async" loading="eager" style={{ position:'absolute', top:'81.6%', left:'0%', width:'100%', height:'auto', zIndex:'4', opacity:'1', visibility:'visible' }} />
      
      <img src={eighthSequence[27]} className="panel25" decoding="async" loading="eager" style={{ position:'absolute', top:'85%', left:'0%', width:'100%', height:'auto', zIndex:'5', opacity:'1', visibility:'visible' }} />
      <img src={eighthSequence[28]} className="panel25 olhoBG" decoding="async" loading="eager" style={{ position:'absolute', top:'85%', left:'0%', width:'100%', height:'auto', zIndex:'3', opacity:'1', visibility:'visible' }} />
      <img src={eighthSequence[29]} className="panel25 pupila" decoding="async" loading="eager" style={{ position:'absolute', top:'85%', left:'0%', width:'100%', height:'auto', zIndex:'4', opacity:'1', visibility:'visible' }} />

      <img src={eighthSequence[p26Index]} className="panel26" decoding="async" loading="eager" style={{ position:'absolute', top:'89%', left:'20%', width:'30%', height:'auto', zIndex:'2', opacity:'1', visibility:'visible' }} />
      
      <img src={eighthSequence[32]} className="panel27" decoding="async" loading="eager" style={{ position:'absolute', top:'89.4%', right:'29%', width:'11%', height:'auto', zIndex:'4', opacity:'1', visibility:'visible' }} />
</>)}

{!cancelledNinthSequence && (<>
      <img src={ninthSequence[0]} className="panel28" decoding="async" loading="eager" style={{ position:'absolute', top:'92.7%', left:'0%', width:'100%', height:'auto', zIndex:'2', opacity:'1', visibility:'visible' }} />
      <img src={ninthSequence[1]} className="panel28" decoding="async" loading="eager" style={{ position:'absolute', top:'92.7%', left:'0%', width:'100%', height:'auto', zIndex:'4', opacity:'1', visibility:'visible' }} />
      <img src={ninthSequence[2]} className="panel28 pantera" decoding="async" loading="eager" style={{ position:'absolute', top:'94%', left:'0%', width:'100%', height:'auto', zIndex:'3', opacity:'1', visibility:'visible' }} />
      <img src={ninthSequence[3]} className="panel29" decoding="async" loading="eager" style={{ position:'absolute', top:'92.3%', left:'0%', width:'100%', height:'auto', zIndex:'4', opacity:'1', visibility:'visible' }} />

      <img src={ninthSequence[lastPanelIndex]} className='panel30' decoding="async" loading="eager" style={{ position:'absolute', bottom:'0', left:'0%', width:'100%', height:'auto', zIndex:'2', opacity:'1', visibility:'visible' }} />
      <img src={ninthSequence[lpPanteraIndex]} className='panel30 pantera' decoding="async" loading="eager" style={{ position:'absolute', bottom:'0', left:'0%', width:'100%', height:'auto', zIndex:'3', opacity:'0', visibility:'visible' }} />
      <img src={ninthSequence[18]} className='theEnd' decoding="async" loading="eager" style={{ position:'absolute', bottom:'0', left:'0%', width:'100%', height:'auto', zIndex:'9', opacity:'0', visibility:'visible' }} />
      
</>)}
      </div>
      </div>
      </>)}
      </div>
      
  );
}
