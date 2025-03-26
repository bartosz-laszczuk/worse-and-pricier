import { signalStore, withState } from '@ngrx/signals';
import { User } from '../../models/user.models';

type UserState = {
  entity: User | null;
  uid: string | null;
  isLoading: boolean | null;
  error: string | null;
};

const initialState: UserState = {
  entity: null,
  uid: null,
  isLoading: null,
  error: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState)
);
