import { Algorithm } from './algorithms/algorithm';
import { Quicksort } from './algorithms/quicksort';
import { MergeSort } from './algorithms/merge-sort';
import { InsertionSort } from './algorithms/insertion-sort';
import { GravitySort } from './algorithms/gravity-sort';
import { RadixSort } from './algorithms/radix-sort';
import { CountingSort } from './algorithms/counting-sort';

export class AlgorithmFactory {
    public static getAlgorithm(alg: Algorithms): Algorithm {
        switch (alg) {
            case Algorithms.QuickSort:
                return new Quicksort();
            case Algorithms.MergeSort:
                return new MergeSort();
            case Algorithms.InsertionSort:
                return new InsertionSort();
            case Algorithms.GravitySort:
                return new GravitySort();
            case Algorithms.RadixSort:
                return new RadixSort();
            case Algorithms.CountingSort:
                return new CountingSort();
        }
    }
}

export enum Algorithms {
    QuickSort = 'QuickSort',
    MergeSort = 'MergeSort',
    InsertionSort = 'InsertionSort',
    GravitySort = 'GravitySort',
    RadixSort = 'RadixSort',
    CountingSort = 'CountingSort'
}
