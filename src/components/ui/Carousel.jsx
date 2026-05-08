import React, { useCallback, useEffect, useState, createContext, useContext } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./Button";

const CarouselContext = createContext(null);

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) throw new Error("Use inside Carousel");
  return context;
}

export function Carousel({ children, className, ...props }) {
  const [carouselRef, api] = useEmblaCarousel();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    update();
    api.on("select", update);
  }, [api, update]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        scrollPrev: () => api?.scrollPrev(),
        scrollNext: () => api?.scrollNext(),
        canPrev,
        canNext,
      }}
    >
      <div className={cn("relative", className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }) {
  const { carouselRef } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div className={cn("flex -ml-4", className)} {...props} />
    </div>
  );
}

export function CarouselItem({ className, ...props }) {
  return (
    <div
      className={cn("pl-4 basis-full shrink-0 grow-0", className)}
      {...props}
    />
  );
}

export function CarouselPrevious(props) {
  const { scrollPrev, canPrev } = useCarousel();

  return (
    <Button
      className="absolute left-2 top-1/2 -translate-y-1/2"
      onClick={scrollPrev}
      disabled={!canPrev}
      {...props}
    >
      <ArrowLeft />
    </Button>
  );
}

export function CarouselNext(props) {
  const { scrollNext, canNext } = useCarousel();

  return (
    <Button
      className="absolute right-2 top-1/2 -translate-y-1/2"
      onClick={scrollNext}
      disabled={!canNext}
      {...props}
    >
      <ArrowRight />
    </Button>
  );
}