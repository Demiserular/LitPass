// # LitPass Development Roadmap

// ## Project Status Overview

// ### ✅ Completed
// - React Native with Expo setup
// - TypeScript integration
// - Navigation with Expo Router
// - UI component library foundation
// - Theme system implementation
// - Mock data for events and profiles
// - Basic animations and transitions
// - Camera and QR code functionality
// - Tab-based navigation structure

// ### 🚀 Next Phase Focus
// - Supabase backend integration
// - State management with Redux Toolkit
// - Authentication system
// - CI/CD pipeline setup
// - Testing framework implementation
// - Persistent storage solutions

// ## Detailed Implementation Roadmap

// ### 1. Supabase Integration
// > *Estimated time: 2 weeks*

// #### Week 1: Setup & Schema Design
// - [x] 1.1. Install Supabase JS client
// ```bash
// npm install @supabase/supabase-js
// ```

// - [x] 1.2. Create Supabase project and configure environment variables
// ```typescript
// // Create .env file with
// EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
// EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
// ```

// - [x] 1.3. Create Supabase client utility
// ```typescript
// // utils/supabaseClient.ts
// import { createClient } from '@supabase/supabase-js';
// import 'react-native-url-polyfill/auto';

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ```

// - [ ] 1.4. Design and create database tables in Supabase
//   - Users table
//   - Events table
//   - Tickets table
//   - Transactions table
//   - Stories table

// - [ ] 1.5. Set up Row-Level Security (RLS) policies

// #### Week 2: API Implementation
// - [x] 1.6. Create API hooks for event data
// ```typescript
// // hooks/useEvents.ts
// export function useEvents() {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function fetchEvents() {
//       try {
//         const { data, error } = await supabase
//           .from('events')
//           .select('*');
          
//         if (error) throw error;
//         setEvents(data || []);
//       } catch (e) {
//         setError(e);
//       } finally {
//         setLoading(false);
//       }
//     }
    
//     fetchEvents();
//   }, []);

//   return { events, loading, error };
// }
// ```

// - [x] 1.7. Create API hooks for user profiles
// - [x] 1.8. Create API hooks for tickets and transactions
// - [x] 1.9. Create API hooks for stories
// - [x] 1.9.1. Create API hooks for wallet
// - [/] 1.10. Update mock data components to use real data

// ### 2. Redux Toolkit Integration
// > *Estimated time: 1 week*

// - [x] 2.1. Install Redux Toolkit and React-Redux
// ```bash
// npm install @reduxjs/toolkit react-redux
// ```

// - [x] 2.2. Create store configuration
// ```typescript
// // store/index.ts
// import { configureStore } from '@reduxjs/toolkit';
// import userReducer from './slices/userSlice';
// import eventsReducer from './slices/eventsSlice';
// import ticketsReducer from './slices/ticketsSlice';

// export const store = configureStore({
//   reducer: {
//     user: userReducer,
//     events: eventsReducer,
//     tickets: ticketsReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
// ```

// - [x] 2.3. Create typed hooks
// ```typescript
// // store/hooks.ts
// import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
// import type { RootState, AppDispatch } from './index';

// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
// ```

// - [x] 2.4. Create user slice
// ```typescript
// // store/slices/userSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface UserState {
//   id: string | null;
//   email: string | null;
//   name: string | null;
//   avatarUrl: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
// }

// const initialState: UserState = {
//   id: null,
//   email: null,
//   name: null,
//   avatarUrl: null,
//   isAuthenticated: false,
//   isLoading: false,
// };

// export const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     // Add reducers here
//     setUser: (state, action: PayloadAction<Partial<UserState>>) => {
//       return { ...state, ...action.payload };
//     },
//     clearUser: () => initialState,
//   },
// });

// export const { setUser, clearUser } = userSlice.actions;
// export default userSlice.reducer;
// ```

// - [x] 2.5. Create events slice
// - [x] 2.6. Create tickets slice
// - [x] 2.7. Create async thunks for API calls
// - [x] 2.8. Wrap app with Provider
// ```typescript
// // App.tsx or _layout.tsx
// import { Provider } from 'react-redux';
// import { store } from './store';

// export default function App() {.
//   return (
//     <Provider store={store}>
//       {/* Your app components */}
//     </Provider>
//   );
// }
// ```

// - [ ] 2.9. Integrate Redux with existing components

// ### 3. Authentication System
// > *Estimated time: 1 week*

// - [ ] 3.1. Create authentication UI components
//   - [ ] Login screen
//   - [ ] Registration screen
//   - [ ] Forgot password screen
//   - [ ] OTP verification screen

// - [x] 3.2. Set up Supabase Auth
// ```typescript
// // utils/auth.ts
// import { supabase } from './supabaseClient';

// export async function signIn(email: string, password: string) {
//   return await supabase.auth.signInWithPassword({ email, password });
// }

// export async function signUp(email: string, password: string) {
//   return await supabase.auth.signUp({ email, password });
// }

// export async function signOut() {
//   return await supabase.auth.signOut();
// }

// export async function resetPassword(email: string) {
//   return await supabase.auth.resetPasswordForEmail(email);
// }
// ```

// - [ ] 3.3. Create auth context or Redux slice
// - [ ] 3.4. Implement protected routes
// - [ ] 3.5. Add social login options (Google, Apple)
// - [ ] 3.6. Implement session persistence
// - [ ] 3.7. Add authentication state to Redux

// ### 4. CI/CD Pipeline Setup
// > *Estimated time: 3 days*

// - [ ] 4.1. Set up GitHub Actions for CI
// ```yaml
// # .github/workflows/ci.yml
// name: CI

// on:
//   push:
//     branches: [main, develop]
//   pull_request:
//     branches: [main, develop]

// jobs:
//   test:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v3
//       - uses: actions/setup-node@v3
//         with:
//           node-version: 18
//           cache: npm
//       - run: npm ci
//       - run: npm run lint
//       - run: npm run test
// ```

// - [ ] 4.2. Set up EAS Build for Expo
// ```bash
// npm install -g eas-cli
// eas build:configure
// ```

// - [ ] 4.3. Create build profiles in eas.json
// ```json
// {
//   "cli": {
//     "version": ">= 3.13.3"
//   },
//   "build": {
//     "development": {
//       "developmentClient": true,
//       "distribution": "internal"
//     },
//     "preview": {
//       "distribution": "internal"
//     },
//     "production": {}
//   }
// }
// ```

// - [ ] 4.4. Set up automatic deployment with GitHub Actions
// ```yaml
// # .github/workflows/deploy.yml
// name: Deploy

// on:
//   push:
//     branches: [main]

// jobs:
//   deploy:
//     runs-on: ubuntu-latest
//     steps:
//       - uses: actions/checkout@v3
//       - uses: actions/setup-node@v3
//         with:
//           node-version: 18
//           cache: npm
//       - uses: expo/expo-github-action@v8
//         with:
//           eas-version: latest
//           token: ${{ secrets.EXPO_TOKEN }}
//       - run: npm ci
//       - run: eas build --platform all --non-interactive
//       - run: eas submit --platform all --non-interactive
// ```

// - [ ] 4.5. Configure environment variables in CI/CD
// - [ ] 4.6. Set up staging and production environments

// ### 5. Testing Framework
// > *Estimated time: 1 week*

// - [x] 5.1. Install Jest and React Testing Library
// ```bash
// npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
// ```

// - [x] 5.2. Configure Jest for React Native
// ```javascript
// // jest.config.js
// module.exports = {
//   preset: 'jest-expo',
//   transformIgnorePatterns: [
//     'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
//   ],
//   setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
// };
// ```

// - [x] 5.3. Create basic component tests
// ```typescript
// // components/__tests__/ThemedText-test.tsx
// import React from 'react';
// import { render } from '@testing-library/react-native';
// import { ThemedText } from '../ThemedText';

// describe('<ThemedText />', () => {
//   it('renders correctly', () => {
//     const { getByText } = render(<ThemedText>Test Text</ThemedText>);
//     expect(getByText('Test Text')).toBeTruthy();
//   });
// });
// ```

// - [ ] 5.4. Create hook tests
// - [ ] 5.5. Create Redux tests
// - [ ] 5.6. Set up E2E testing with Maestro
// ```bash
// npm install --save-dev maestro
// ```

// - [ ] 5.7. Create E2E test flows
// ```yaml
// # .maestro/login_flow.yaml
// appId: com.yourcompany.litpass
// ---
// - launchApp
// - tapOn: "Login"
// - inputText: "user@example.com"
//   into: "Email"
// - inputText: "password123"
//   into: "Password"
// - tapOn: "Sign in"
// - assertVisible: "Welcome back"
// ```

// ### 6. Persistent Storage Solutions
// > *Estimated time: 3 days*

// - [x] 6.1. Install AsyncStorage or MMKV
// ```bash
// npm install @react-native-async-storage/async-storage
// ```

// - [x] 6.2. Create storage utility
// ```typescript
// // utils/storage.ts
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export async function storeData(key: string, value: any) {
//   try {
//     const jsonValue = JSON.stringify(value);
//     await AsyncStorage.setItem(key, jsonValue);
//     return true;
//   } catch (e) {
//     console.error('Error storing data:', e);
//     return false;
//   }
// }

// export async function getData(key: string) {
//   try {
//     const jsonValue = await AsyncStorage.getItem(key);
//     return jsonValue != null ? JSON.parse(jsonValue) : null;
//   } catch (e) {
//     console.error('Error retrieving data:', e);
//     return null;
//   }
// }

// export async function removeData(key: string) {
//   try {
//     await AsyncStorage.removeItem(key);
//     return true;
//   } catch (e) {
//     console.error('Error removing data:', e);
//     return false;
//   }
// }
// ```

// - [ ] 6.3. Implement offline storage for events
// - [ ] 6.4. Implement offline storage for tickets
// - [ ] 6.5. Create sync mechanism for offline-online data
// - [ ] 6.6. Add persistence to Redux with redux-persist
// ```bash
// npm install redux-persist
// ```

// ### 7. Performance Optimization
// > *Estimated time: 1 week*

// - [x] 7.1. Implement list virtualization
// - [ ] 7.2. Add memoization to heavy components
// - [x] 7.3. Optimize image loading
// - [/] 7.4. Implement code splitting
// - [ ] 7.5. Set up performance monitoring

// ### 8. Additional Features
// > *Estimated time: 2 weeks*

// - [ ] 8.1. Push notifications
// - [ ] 8.2. Deep linking
// - [ ] 8.3. Social sharing
// - [ ] 8.4. Offline mode improvements
// - [ ] 8.5. Accessibility improvements

// ## Timeline Overview

// 1. **Sprint 1 (2 weeks)**: Supabase Integration
// 2. **Sprint 2 (1 week)**: Redux Toolkit and Testing Framework
// 3. **Sprint 3 (1 week)**: Authentication System
// 4. **Sprint 4 (1 week)**: CI/CD Pipeline and Persistent Storage
// 5. **Sprint 5 (2 weeks)**: Performance Optimization and Additional Features

// ## Resources

// ### Supabase
// - [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
// - [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

// ### Redux
// - [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
// - [React-Redux Hooks](https://react-redux.js.org/api/hooks)

// ### Testing
// - [Testing React Native Apps](https://reactnative.dev/docs/testing-overview)
// - [Jest Documentation](https://jestjs.io/docs/getting-started)

// ### CI/CD
// - [GitHub Actions Documentation](https://docs.github.com/en/actions)
// - [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

// ---

// *This roadmap is a living document and will be updated as the project progresses.*
