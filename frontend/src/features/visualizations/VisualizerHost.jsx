import React from 'react';
import ArrayVisualizer from './ArrayVisualizer';
import LinkedListVisualizer from './LinkedListVisualizer';
import StackVisualizer from './StackVisualizer';
import QueueVisualizer from './QueueVisualizer';
import BinaryTreeVisualizer from './BinaryTreeVisualizer';
import BSTVisualizer from './BSTVisualizer';
import GraphVisualizer from './GraphVisualizer';
import SortingVisualizer from './SortingVisualizer';

export const detectVisualizationType = (visualizationType = 'none', topic = '') => {
  if (visualizationType && visualizationType !== 'none') return visualizationType;
  const t = (topic || '').toLowerCase().trim();
  if (/\b(bst|binary search tree)\b/i.test(t)) return 'bst';
  if (/\b(binary tree|avl tree|red black tree|tree traversal|binary trees)\b/i.test(t)) return 'binary-tree';
  if (/\b(linked list|singly linked|doubly linked|circular linked list|linked lists)\b/i.test(t)) return 'linked-list';
  if (/\b(stack|stacks|call stack|lifo)\b/i.test(t)) return 'stack';
  if (/\b(queue|queues|priority queue|fifo|deque|circular queue)\b/i.test(t)) return 'queue';
  if (/\b(sort|sorting|bubble sort|quick sort|merge sort|insertion sort|selection sort)\b/i.test(t)) return 'sorting';
  if (/\b(graph|graphs|bfs|dfs|dijkstra|shortest path|breadth first search|depth first search)\b/i.test(t)) return 'graph';
  if (/\b(array|arrays|dynamic array|matrix|2d array)\b/i.test(t)) return 'array';
  return 'none';
};

/**
 * Universal Visualizer Host
 * Automatically renders matching React visualization component based on type or topic name.
 */
export const VisualizerHost = ({ visualizationType = 'none', topic = '' }) => {
  const type = detectVisualizationType(visualizationType, topic);

  switch (type) {
    case 'array':
      return <ArrayVisualizer />;
    case 'linked-list':
      return <LinkedListVisualizer />;
    case 'stack':
      return <StackVisualizer />;
    case 'queue':
      return <QueueVisualizer />;
    case 'binary-tree':
      return <BinaryTreeVisualizer />;
    case 'bst':
      return <BSTVisualizer />;
    case 'graph':
      return <GraphVisualizer />;
    case 'sorting':
      return <SortingVisualizer />;
    default:
      return null;
  }
};

export default VisualizerHost;
