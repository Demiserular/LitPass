import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { supabase } from '@/utils/supabaseClient';

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  time: string;
  price: number;
  image: string;
  cover_image_url?: string;
  start_time: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  category?: string;
  capacity?: number;
  is_featured?: boolean;
}

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  error: string | null;
  featuredEvents: Event[];
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
  featuredEvents: [],
};

// Async Thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch events');
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      return data as Event;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch event');
    }
  }
);

export const fetchFeaturedEvents = createAsyncThunk(
  'events/fetchFeaturedEvents',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_featured', true)
        .order('start_time', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data as Event[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch featured events');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
      state.currentEvent = action.payload;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    clearEventsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Event By ID
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Featured Events
      .addCase(fetchFeaturedEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.loading = false;
        state.featuredEvents = action.payload;
      })
      .addCase(fetchFeaturedEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectAllEvents = (state: { events: EventsState }) => state.events.events;
export const selectCurrentEvent = (state: { events: EventsState }) => state.events.currentEvent;
export const selectFeaturedEvents = (state: { events: EventsState }) => state.events.featuredEvents;
export const selectEventById = (eventId: string) => 
  createSelector(
    [selectAllEvents],
    (events) => events.find(event => event.id === eventId)
  );

export const { 
  setEvents, 
  setCurrentEvent, 
  clearCurrentEvent,
  clearEventsError 
} = eventsSlice.actions;

export default eventsSlice.reducer;