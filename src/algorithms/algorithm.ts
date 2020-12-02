import { List } from '../list';

export interface Algorithm {
    sort(list: List): Promise<void>;
}
