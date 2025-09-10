import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/utils/supabaseClient';

interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  qrCode: string;
}

interface TicketsState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  loading: false,
  error: null,
};

export const fetchTickets = createAsyncThunk('tickets/fetchTickets', async (userId: string) => {
  const { data, error } = await supabase.from('tickets').select('*').eq('user_id', userId);
  if (error) {
    throw new Error(error.message);
  }
  return (data || []) as Ticket[];
});

export const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<Ticket[]>) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch tickets';
      });
  },
});

export const { setTickets } = ticketsSlice.actions;
export default ticketsSlice.reducer;