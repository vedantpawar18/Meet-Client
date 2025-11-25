import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import parcelsReducer from './features/parcels/parcelsSlice';
import departmentsReducer from './features/departments/departmentsSlice';
import rulesReducer from './features/rules/rulesSlice';
import usersReducer from './features/users/usersSlice';
import notificationsReducer from './features/notifications/notificationsSlice';
import loadingReducer, { inc, dec } from './features/loading/loadingSlice';

// middleware to automatically track async thunk lifecycle actions
const loadingMiddleware = storeAPI => next => action => {
	try{
		if(action && typeof action.type === 'string'){
			if(action.type.endsWith('/pending')){
				storeAPI.dispatch(inc());
			} else if(action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')){
				storeAPI.dispatch(dec());
			}
		}
	}catch(e){ /* swallow */ }
	return next(action);
};

const store = configureStore({
	reducer: { auth: authReducer, parcels: parcelsReducer, departments: departmentsReducer, rules: rulesReducer, users: usersReducer, notifications: notificationsReducer, loading: loadingReducer },
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loadingMiddleware),
});

export default store;
