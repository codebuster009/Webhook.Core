import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { TOURS } from './tours/index.js';

const STORAGE_KEY = 'wc_tour_prefs';

const DEFAULT_PREFS = {
  completedTours: [],
  globallyDisabled: false,
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function persistPrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* noop */
  }
}

const WalkthroughContext = createContext(null);

export function WalkthroughProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [activeTour, setActiveTour] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const queueRef = useRef([]);

  const updatePrefs = useCallback((updater) => {
    setPrefs((prev) => {
      const next =
        typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      persistPrefs(next);
      return next;
    });
  }, []);

  const activeTourConfig = activeTour ? TOURS[activeTour] : null;
  const steps = activeTourConfig?.steps ?? [];
  const totalSteps = steps.length;

  const emit = useCallback((event, detail = {}) => {
    window.dispatchEvent(new CustomEvent(`wc:tour:${event}`, { detail }));
  }, []);

  useEffect(() => {
    if (!activeTour && queueRef.current.length > 0) {
      const next = queueRef.current.shift();
      setActiveTour(next);
      setCurrentStep(0);
    }
  }, [activeTour]);

  const startTour = useCallback(
    (tourId, { force = false } = {}) => {
      if (prefs.globallyDisabled && !force) return;
      if (prefs.completedTours.includes(tourId) && !force) return;
      if (!TOURS[tourId]) return;

      if (activeTour) {
        if (!queueRef.current.includes(tourId)) queueRef.current.push(tourId);
        return;
      }

      setActiveTour(tourId);
      setCurrentStep(0);
      emit('start', { tourId });
    },
    [prefs, activeTour, emit]
  );

  const closeTour = useCallback(
    (reason = 'close') => {
      if (activeTour) emit('close', { tourId: activeTour, step: currentStep, reason });
      setActiveTour(null);
      setCurrentStep(0);
    },
    [activeTour, currentStep, emit]
  );

  const nextStep = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      updatePrefs((prev) => ({
        ...prev,
        completedTours: [...new Set([...prev.completedTours, activeTour])],
      }));
      emit('complete', { tourId: activeTour });
      setActiveTour(null);
      setCurrentStep(0);
    } else {
      const next = currentStep + 1;
      setCurrentStep(next);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          emit('step', { tourId: activeTour, step: next });
        });
      });
    }
  }, [currentStep, totalSteps, activeTour, updatePrefs, emit]);

  const goToStep = useCallback(
    (index) => {
      if (index < 0 || index >= totalSteps) return;
      setCurrentStep(index);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          emit('step', { tourId: activeTour, step: index });
        });
      });
    },
    [totalSteps, activeTour, emit]
  );

  const prevStep = useCallback(() => {
    setCurrentStep((s) => {
      const next = Math.max(0, s - 1);
      if (next !== s) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            emit('step', { tourId: activeTour, step: next });
          });
        });
      }
      return next;
    });
  }, [activeTour, emit]);

  const skipTour = useCallback(
    (neverShow = false) => {
      if (neverShow && activeTour) {
        updatePrefs((prev) => ({
          ...prev,
          completedTours: [...new Set([...prev.completedTours, activeTour])],
        }));
      }
      emit('skip', { tourId: activeTour, step: currentStep, neverShow });
      closeTour('skip');
    },
    [activeTour, currentStep, updatePrefs, closeTour, emit]
  );

  const disableAll = useCallback(() => {
    updatePrefs({ globallyDisabled: true });
    closeTour('disabled');
  }, [updatePrefs, closeTour]);

  const enableAll = useCallback(() => {
    updatePrefs({ globallyDisabled: false });
  }, [updatePrefs]);

  const resetTour = useCallback(
    (tourId) => {
      updatePrefs((prev) => ({
        ...prev,
        completedTours: prev.completedTours.filter((id) => id !== tourId),
        globallyDisabled: false,
      }));
    },
    [updatePrefs]
  );

  const resetAllTours = useCallback(() => {
    updatePrefs({ completedTours: [], globallyDisabled: false });
  }, [updatePrefs]);

  const isTourCompleted = useCallback(
    (tourId) => prefs.completedTours.includes(tourId),
    [prefs.completedTours]
  );

  return (
    <WalkthroughContext.Provider
      value={{
        activeTour,
        currentStep,
        totalSteps,
        activeTourConfig,
        steps,
        prefs,
        startTour,
        nextStep,
        prevStep,
        goToStep,
        skipTour,
        closeTour,
        disableAll,
        enableAll,
        resetTour,
        resetAllTours,
        isTourCompleted,
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with WalkthroughProvider (same module as FreightKit pattern)
export function useWalkthrough() {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error('useWalkthrough must be used inside WalkthroughProvider');
  return ctx;
}
