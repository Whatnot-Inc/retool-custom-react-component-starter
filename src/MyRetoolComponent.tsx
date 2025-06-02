import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './MyRetoolComponent.css';

// Error Boundary Component for catching ForceGraph2D errors
class ForceGraphErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: string) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ForceGraph2D Error:', error);
    
    // Check if this is a DAG cycle error
    if (error.message && error.message.includes('Invalid DAG structure')) {
      this.props.onError(error.message);
    } else {
      this.props.onError('An error occurred while rendering the graph. Switching to cluster mode.');
    }
  }

  render() {
    if (this.state.hasError) {
      // Reset error state and let parent handle the error
      this.setState({ hasError: false });
      return null;
    }

    return this.props.children;
  }
}

/**
 * This is a custom Retool component that uses the Retool API to get the count state.
 *
 * FOR LOCAL DEVELOPMENT WITH `npm run start`:
 * 1. Comment out the next line (real Retool import)
 * 2. Uncomment the mock import line below
 *
 * FOR PRODUCTION/DEPLOYMENT TO RETOOL:
 * 1. Comment out the mock import line
 * 2. Uncomment the real Retool import line
 */

// import { Retool } from '@tryretool/custom-component-support';
import { Retool } from './mocks/retool'

interface Node {
  asset_key: string;
  domain: string;
  type: string;
  [key: string]: any;
}

interface Edge {
  source_asset_key: string;
  target_asset_key: string;
  [key: string]: any;
}



interface DomainColors {
  background: string;
  node: string;
}

const domainColors: Record<string, DomainColors> = {
  growth: {
    background: 'rgba(78, 205, 196, 0.2)', // Teal
    node: '#4ECDC4'
  },
  data_platforms: {
    background: 'rgba(255, 107, 107, 0.2)', // Red
    node: '#FF6B6B'
  },
  unknown: {
    background: 'rgba(128, 128, 128, 0.2)', // Gray
    node: '#808080'
  },
  // Additional domains found in the data
  chalk: {
    background: 'rgba(156, 39, 176, 0.2)', // Purple
    node: '#9C27B0'
  },
  annoy: {
    background: 'rgba(255, 193, 7, 0.2)', // Amber
    node: '#FFC107'
  },
  chalk_monitoring: {
    background: 'rgba(244, 67, 54, 0.2)', // Red variant
    node: '#F44336'
  },
  chalk_feature_datasets: {
    background: 'rgba(63, 81, 181, 0.2)', // Indigo
    node: '#3F51B5'
  },
  default: {
    background: 'rgba(31, 119, 180, 0.2)', // Blue with transparency
    node: '#1f77b4'
  }
};

// CSV Loading Functions
const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.trim().split('\n');
  return lines.map(line => {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i - 1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current.trim());
    return row;
  });
};

const loadCSVData = async (): Promise<{ nodes: Node[], edges: Edge[] }> => {
  try {
    console.log('Starting CSV data load...');
    const [nodesResponse, edgesResponse] = await Promise.all([
      fetch('/data/nodes.csv'),
      fetch('/data/edges.csv')
    ]);

    console.log('CSV fetch responses:', { 
      nodesOk: nodesResponse.ok, 
      edgesOk: edgesResponse.ok,
      nodesStatus: nodesResponse.status,
      edgesStatus: edgesResponse.status
    });

    if (!nodesResponse.ok || !edgesResponse.ok) {
      throw new Error(`Failed to load CSV files: nodes=${nodesResponse.status}, edges=${edgesResponse.status}`);
    }

    const [nodesText, edgesText] = await Promise.all([
      nodesResponse.text(),
      edgesResponse.text()
    ]);

    // Parse nodes CSV
    const nodeRows = parseCSV(nodesText);
    const nodeHeaders = nodeRows[0];
    const nodeData = nodeRows.slice(1);
    
    console.log('Node headers:', nodeHeaders);
    console.log('First few node rows:', nodeData.slice(0, 3));

    const nodes: Node[] = nodeData.map(row => {
      const node: any = {};
      nodeHeaders.forEach((header, index) => {
        node[header.toLowerCase()] = row[index] || '';
      });
      
      return {
        asset_key: node.asset_key || '',
        domain: node.domain || 'unknown',
        type: node.resource_type || 'unknown',
        asset_group: node.asset_group || '',
        service_tier: node.service_tier || ''
      };
    }).filter(node => node.asset_key); // Filter out empty nodes
    
    console.log(`Parsed ${nodes.length} nodes from ${nodeData.length} rows`);

    // Parse edges CSV
    const edgeRows = parseCSV(edgesText);
    const edgeHeaders = edgeRows[0];
    const edgeData = edgeRows.slice(1);
    
    console.log('Edge headers:', edgeHeaders);
    console.log('First few edge rows:', edgeData.slice(0, 3));

    const edges: Edge[] = edgeData.map(row => {
      const edge: any = {};
      edgeHeaders.forEach((header, index) => {
        edge[header.toLowerCase()] = row[index] || '';
      });
      
      return {
        source_asset_key: edge.source_asset_key || '',
        target_asset_key: edge.target_asset_key || ''
      };
    }).filter(edge => edge.source_asset_key && edge.target_asset_key); // Filter out empty edges
    
    console.log(`Parsed ${edges.length} edges from ${edgeData.length} rows`);

    return { nodes, edges };
  } catch (error) {
    console.error('Error loading CSV data:', error);
    // Return empty data on error
    return { nodes: [], edges: [] };
  }
};

// Fallback sample data (kept for development/testing)
const fallbackNodes: Node[] = [
  { asset_key: "users_table", domain: "ecommerce", type: "table" },
  { asset_key: "orders_table", domain: "ecommerce", type: "table" },
  { asset_key: "products_table", domain: "ecommerce", type: "table" },
  { asset_key: "user_service", domain: "ecommerce", type: "service" },
  { asset_key: "order_service", domain: "ecommerce", type: "service" },
  { asset_key: "analytics_db", domain: "analytics", type: "table" },
  { asset_key: "analytics_service", domain: "analytics", type: "service" }
];

const fallbackEdges: Edge[] = [
  { source_asset_key: "user_service", target_asset_key: "users_table" },
  { source_asset_key: "order_service", target_asset_key: "orders_table" },
  { source_asset_key: "order_service", target_asset_key: "products_table" },
  { source_asset_key: "order_service", target_asset_key: "users_table" },
  { source_asset_key: "analytics_service", target_asset_key: "analytics_db" },
  { source_asset_key: "order_service", target_asset_key: "analytics_service" }
];

const MyRetoolComponent = () => {
  // State for loading CSV data
  const [isLoading, setIsLoading] = useState(true);
  const [loadedNodes, setLoadedNodes] = useState<Node[]>(fallbackNodes);
  const [loadedEdges, setLoadedEdges] = useState<Edge[]>(fallbackEdges);

  // Load CSV data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { nodes, edges } = await loadCSVData();
        console.log(`Loaded ${nodes.length} nodes and ${edges.length} edges from CSV`);
        if (nodes.length > 0 && edges.length > 0) {
          setLoadedNodes(nodes);
          setLoadedEdges(edges);
          console.log('Successfully set loaded nodes and edges');
        } else {
          console.warn('CSV data was empty, using fallback data');
        }
      } catch (error) {
        console.error('Failed to load CSV data, using fallback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Use loaded CSV data directly, with Retool state as override capability
  const [nodesState] = Retool.useStateArray({
    name: 'nodes',
    initialValue: []
  }) || [[]];

  const [edgesState] = Retool.useStateArray({
    name: 'edges',
    initialValue: []
  }) || [[]];

  // Use CSV loaded data if available, otherwise fall back to Retool state
  const nodes = (nodesState as unknown as Node[]).length > 0 
    ? (nodesState as unknown as Node[]) 
    : loadedNodes;
  
  const edges = (edgesState as unknown as Edge[]).length > 0 
    ? (edgesState as unknown as Edge[]) 
    : loadedEdges;

  // Debug logging
  console.log('Final data being used:', { 
    nodeCount: nodes.length, 
    edgeCount: edges.length,
    isLoading,
    retoolNodesLength: (nodesState as unknown as Node[]).length,
    loadedNodesLength: loadedNodes.length
  });

  // Force Graph Component State
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [clusteringMode, setClusteringMode] = useState<'dag' | 'cluster'>('cluster');
  const [hasCycles, setHasCycles] = useState(false);
  const [dagError, setDagError] = useState<string | null>(null);
  const [selectedRootNode, setSelectedRootNode] = useState<string>('');
  const [connectionDepth, setConnectionDepth] = useState<number>(2);
  const [showAllNodes, setShowAllNodes] = useState<boolean>(false); // Start in subgraph mode
  const [hasSetDefaultNode, setHasSetDefaultNode] = useState<boolean>(false);
  const [isNodeSearchOpen, setIsNodeSearchOpen] = useState(false);
  const [nodeSearchTerm, setNodeSearchTerm] = useState<string>('');

  // Auto-select a good default node when data loads
  useEffect(() => {
    if (!isLoading && nodes.length > 0 && edges.length > 0 && !hasSetDefaultNode) {
      const defaultNode = findBestDefaultNode(nodes, edges);
      if (defaultNode) {
        setSelectedRootNode(defaultNode);
        setHasSetDefaultNode(true);
        console.log(`Auto-selected default node: ${defaultNode}`);
      }
    }
  }, [isLoading, nodes.length, edges.length, hasSetDefaultNode]);

  // Detect cycles in the graph using DFS and return detailed cycle information
  const detectCycles = (nodes: any[], links: any[]): { hasCycles: boolean; cyclePath?: string[] } => {
    if (!nodes || nodes.length === 0 || !links || links.length === 0) {
      return { hasCycles: false };
    }

    try {
      const graph: Record<string, string[]> = {};
      const visited: Record<string, boolean> = {};
      const recStack: Record<string, boolean> = {};

      // Initialize all nodes
      nodes.forEach(node => {
        if (node && node.id) {
          graph[node.id] = [];
          visited[node.id] = false;
          recStack[node.id] = false;
        }
      });

      // Build adjacency list from data links
      links.forEach(link => {
        if (link && link.source && link.target) {
          // Handle both string IDs and object references
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          
          if (sourceId && targetId && sourceId !== targetId && graph[sourceId] !== undefined && graph[targetId] !== undefined) {
            // Avoid self-loops and ensure both nodes exist
            graph[sourceId].push(targetId);
          }
        }
      });

      // DFS function to detect cycles and track path
      const dfs = (nodeId: string, path: string[]): string[] | null => {
        if (!nodeId || visited[nodeId] === undefined) return null;
        
        visited[nodeId] = true;
        recStack[nodeId] = true;
        path.push(nodeId);

        for (const neighbor of graph[nodeId] || []) {
          if (!visited[neighbor]) {
            const cyclePath = dfs(neighbor, [...path]);
            if (cyclePath) return cyclePath;
          } else if (recStack[neighbor]) {
            // Found a cycle - return the path from the cycle start
            const cycleStartIndex = path.indexOf(neighbor);
            return [...path.slice(cycleStartIndex), neighbor];
          }
        }

        recStack[nodeId] = false;
        return null;
      };

      // Check each unvisited node
      for (const nodeId of Object.keys(graph)) {
        if (!visited[nodeId]) {
          const cyclePath = dfs(nodeId, []);
          if (cyclePath) {
            return { hasCycles: true, cyclePath };
          }
        }
      }

      return { hasCycles: false };
    } catch (error) {
      console.warn('Error during cycle detection:', error);
      // If there's an error in cycle detection, assume there are cycles to be safe
      return { hasCycles: true };
    }
  };

  // Function to find the best default node (highly connected, interesting name)
  const findBestDefaultNode = (allNodes: Node[], allEdges: Edge[]): string | null => {
    if (allNodes.length === 0) return null;
    
    // Calculate connection counts for each node
    const connectionCounts = new Map<string, number>();
    allNodes.forEach(node => connectionCounts.set(node.asset_key, 0));
    
    allEdges.forEach(edge => {
      connectionCounts.set(edge.source_asset_key, (connectionCounts.get(edge.source_asset_key) || 0) + 1);
      connectionCounts.set(edge.target_asset_key, (connectionCounts.get(edge.target_asset_key) || 0) + 1);
    });
    
    // Find interesting nodes with good connectivity
    const candidates = allNodes.filter(node => {
      const connections = connectionCounts.get(node.asset_key) || 0;
      return connections >= 3; // At least 3 connections
    });
    
    if (candidates.length === 0) {
      // Fallback to most connected node
      let maxConnections = 0;
      let bestNode = allNodes[0].asset_key;
      
      for (const [nodeId, connections] of connectionCounts.entries()) {
        if (connections > maxConnections) {
          maxConnections = connections;
          bestNode = nodeId;
        }
      }
      return bestNode;
    }
    
    // Prefer nodes with interesting patterns in their names
    const interestingPatterns = [
      /database/i,
      /table/i,
      /service/i,
      /api/i,
      /events/i,
      /user/i,
      /order/i,
      /core/i,
      /main/i
    ];
    
    for (const pattern of interestingPatterns) {
      const matches = candidates.filter(node => pattern.test(node.asset_key));
      if (matches.length > 0) {
        // Return the most connected among matches
        return matches.reduce((best, current) => {
          const bestConnections = connectionCounts.get(best.asset_key) || 0;
          const currentConnections = connectionCounts.get(current.asset_key) || 0;
          return currentConnections > bestConnections ? current : best;
        }).asset_key;
      }
    }
    
    // Fallback to most connected candidate
    return candidates.reduce((best, current) => {
      const bestConnections = connectionCounts.get(best.asset_key) || 0;
      const currentConnections = connectionCounts.get(current.asset_key) || 0;
      return currentConnections > bestConnections ? current : best;
    }).asset_key;
  };

  // Function to find connected nodes within specified depth
  const findConnectedNodes = (rootNodeId: string, depth: number, allNodes: Node[], allEdges: Edge[]): Set<string> => {
    if (!rootNodeId || depth <= 0) return new Set();
    
    const connectedNodes = new Set<string>([rootNodeId]);
    const visited = new Set<string>();
    
    // Build adjacency map (bidirectional)
    const adjacencyMap = new Map<string, Set<string>>();
    allEdges.forEach(edge => {
      if (!adjacencyMap.has(edge.source_asset_key)) {
        adjacencyMap.set(edge.source_asset_key, new Set());
      }
      if (!adjacencyMap.has(edge.target_asset_key)) {
        adjacencyMap.set(edge.target_asset_key, new Set());
      }
      
      adjacencyMap.get(edge.source_asset_key)!.add(edge.target_asset_key);
      adjacencyMap.get(edge.target_asset_key)!.add(edge.source_asset_key);
    });
    
    // BFS to find nodes within depth
    let currentLevel = [rootNodeId];
    let currentDepth = 0;
    
    while (currentLevel.length > 0 && currentDepth < depth) {
      const nextLevel: string[] = [];
      
      for (const nodeId of currentLevel) {
        if (visited.has(nodeId)) continue;
        visited.add(nodeId);
        
        const neighbors = adjacencyMap.get(nodeId) || new Set();
        for (const neighbor of neighbors) {
          if (!connectedNodes.has(neighbor)) {
            connectedNodes.add(neighbor);
            nextLevel.push(neighbor);
          }
        }
      }
      
      currentLevel = nextLevel;
      currentDepth++;
    }
    
    return connectedNodes;
  };

  // Get unique domains and types for the filters
  const domains = [...new Set(nodes.map(node => node.domain))];
  const types = [...new Set(nodes.map(node => node.type))];

  // Transform the data for the force graph
  let filteredNodes = nodes.filter(node => {
    const domainMatch = selectedDomains.length === 0 || selectedDomains.includes(node.domain);
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(node.type);
    return domainMatch && typeMatch;
  });

  // Apply subgraph filtering if a root node is selected
  if (!showAllNodes && selectedRootNode) {
    // Check if the selected root node exists in the current nodes
    const rootNodeExists = nodes.some(node => node.asset_key === selectedRootNode);
    if (!rootNodeExists) {
      console.warn(`Selected root node ${selectedRootNode} not found in current nodes, clearing selection`);
      setSelectedRootNode('');
    } else {
      const connectedNodeIds = findConnectedNodes(selectedRootNode, connectionDepth, nodes, edges);
      const beforeCount = filteredNodes.length;
      filteredNodes = filteredNodes.filter(node => connectedNodeIds.has(node.asset_key));
      console.log(`Subgraph filter: ${beforeCount} → ${filteredNodes.length} nodes connected to ${selectedRootNode} within ${connectionDepth} hops`);
    }
  }

  // No domain clustering - using only real edges

  // Create a set of filtered node IDs for fast lookup
  const filteredNodeIds = new Set(filteredNodes.map(node => node.asset_key));

  const graphData = {
    nodes: filteredNodes.map(node => ({
      id: node.asset_key,
      ...node
    })),
    links: edges
      .filter(edge => {
        // First check if both source and target nodes exist in our filtered set
        if (!filteredNodeIds.has(edge.source_asset_key) || !filteredNodeIds.has(edge.target_asset_key)) {
          return false;
        }
        
        const sourceNode = nodes.find(n => n.asset_key === edge.source_asset_key);
        const targetNode = nodes.find(n => n.asset_key === edge.target_asset_key);
        if (!sourceNode || !targetNode) return false;
        
        const sourceDomainMatch = selectedDomains.length === 0 || selectedDomains.includes(sourceNode.domain);
        const targetDomainMatch = selectedDomains.length === 0 || selectedDomains.includes(targetNode.domain);
        const sourceTypeMatch = selectedTypes.length === 0 || selectedTypes.includes(sourceNode.type);
        const targetTypeMatch = selectedTypes.length === 0 || selectedTypes.includes(targetNode.type);
        
        return sourceDomainMatch && targetDomainMatch && sourceTypeMatch && targetTypeMatch;
      })
      .map(edge => ({
        source: edge.source_asset_key,
        target: edge.target_asset_key,
        ...edge
      }))
  };

  // Validate graph data integrity
  const validateGraphData = (nodes: any[], links: any[]) => {
    const nodeIds = new Set(nodes.map(n => n.id));
    const invalidLinks = links.filter(link => 
      !nodeIds.has(link.source) || !nodeIds.has(link.target)
    );
    
    if (invalidLinks.length > 0) {
      console.warn(`Found ${invalidLinks.length} invalid links:`, invalidLinks.slice(0, 5));
      // Return filtered links
      return links.filter(link => nodeIds.has(link.source) && nodeIds.has(link.target));
    }
    
    return links;
  };

  // Ensure all links reference valid nodes
  graphData.links = validateGraphData(graphData.nodes, graphData.links);

  // Check for cycles in the graph data
  console.log(`Graph data: ${graphData.nodes.length} nodes, ${graphData.links.length} edges`);
  
  const cycleDetectionResult = detectCycles(graphData.nodes, graphData.links);
  const currentHasCycles = cycleDetectionResult.hasCycles;
  
  // Update hasCycles state and error message if it's different
  useEffect(() => {
    if (currentHasCycles !== hasCycles) {
      setHasCycles(currentHasCycles);
      
      // Set error message if cycles are detected
      if (currentHasCycles && cycleDetectionResult.cyclePath) {
        const cyclePathStr = cycleDetectionResult.cyclePath.join(' → ');
        setDagError(`Invalid DAG structure! Found cycle: ${cyclePathStr}`);
        // Force cluster mode when cycles are detected
        setClusteringMode('cluster');
      } else {
        setDagError(null);
      }
    }
  }, [currentHasCycles, hasCycles, cycleDetectionResult.cyclePath]);

  // Force cluster mode if cycles are detected
  // Always use undefined (cluster mode) if there are any cycles or if not explicitly in DAG mode
  const safeDagMode = clusteringMode === 'dag' && !currentHasCycles && graphData.nodes.length > 0 ? 'lr' : undefined;



  const getDomainColors = (domain: string): DomainColors => {
    return domainColors[domain] || domainColors.default;
  };

  const getNodeColor = (node: any) => {
    // Highlight the root node if in subgraph mode
    if (!showAllNodes && selectedRootNode && node.id === selectedRootNode) {
      return '#FF4444'; // Red highlight for root node
    }
    return getDomainColors(node.domain).node;
  };



  const getLinkColor = (link: any) => {
    const sourceNode = graphData.nodes.find(n => n.id === link.source);
    const targetNode = graphData.nodes.find(n => n.id === link.target);
    return sourceNode?.domain !== targetNode?.domain ? '#FFD93D' : '#999';
  };

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  const handleBackgroundClick = () => {
    setSelectedNode(null);
  };

  const handleForceGraphError = (errorMessage: string) => {
    console.error('Force graph error:', errorMessage);
    setDagError(errorMessage);
    setClusteringMode('cluster');
    setHasCycles(true);
  };

  const toggleDomain = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getSelectedText = (items: string[]) => {
    if (items.length === 0) return 'All';
    if (items.length === 1) return items[0].charAt(0).toUpperCase() + items[0].slice(1);
    return `${items.length} selected`;
  };

  if (isLoading) {
    return (
      <div className="my-retool-component my-retool-component-container">
        <h1 className="my-retool-component-title">Force Graph Visualization</h1>
        <div className="graph-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading graph data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-retool-component my-retool-component-container">
      <h1 className="my-retool-component-title">Force Graph Visualization</h1>
      <div className="graph-container">
        <div ref={containerRef} className="force-graph-container">
          {dagError && (
            <div className="dag-error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{dagError}</span>
              <button 
                className="error-dismiss"
                onClick={() => setDagError(null)}
                title="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
          <div className="graph-controls">
            <div className="dropdown-filter">
              <button 
                className="dropdown-button"
                onClick={() => setShowAllNodes(!showAllNodes)}
                style={{
                  backgroundColor: showAllNodes ? 'white' : '#4ECDC4',
                  color: showAllNodes ? '#333' : 'white'
                }}
              >
                <span>{showAllNodes ? 'Show All Nodes' : 'Show Subgraph'}</span>
              </button>
            </div>
            
            {!showAllNodes && (
              <>
                <div className="dropdown-filter">
                  <button 
                    className="dropdown-button"
                    onClick={() => setIsNodeSearchOpen(!isNodeSearchOpen)}
                  >
                    <span>Root: {selectedRootNode || 'Select Node'}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {isNodeSearchOpen && (
                    <div className="dropdown-content node-search-dropdown">
                      <input
                        type="text"
                        placeholder="Search nodes..."
                        value={nodeSearchTerm}
                        onChange={(e) => setNodeSearchTerm(e.target.value)}
                        className="node-search-input"
                        autoFocus
                      />
                      <div className="node-search-results">
                        {nodes
                          .filter(node => 
                            node.asset_key.toLowerCase().includes(nodeSearchTerm.toLowerCase())
                          )
                          .slice(0, 20)
                          .map(node => (
                            <div
                              key={node.asset_key}
                              className="node-search-item"
                              onClick={() => {
                                setSelectedRootNode(node.asset_key);
                                setIsNodeSearchOpen(false);
                                setNodeSearchTerm('');
                              }}
                            >
                              <div className="node-search-name">{node.asset_key}</div>
                              <div className="node-search-meta">{node.domain} • {node.type}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="dropdown-filter">
                  <button 
                    className="dropdown-button"
                    onClick={() => setConnectionDepth(connectionDepth === 1 ? 2 : connectionDepth === 2 ? 3 : 1)}
                  >
                    <span>Depth: {connectionDepth}</span>
                  </button>
                </div>
              </>
            )}
            
            <div className="dropdown-filter">
              <button 
                className="dropdown-button"
                onClick={() => {
                  if (!currentHasCycles) {
                    const newMode = clusteringMode === 'dag' ? 'cluster' : 'dag';
                    setClusteringMode(newMode);
                    // Clear error when switching to cluster mode
                    if (newMode === 'cluster') {
                      setDagError(null);
                    }
                  } else {
                    // Automatically switch to cluster mode when cycles are detected
                    setClusteringMode('cluster');
                    setDagError(null);
                    console.log('Switched to cluster mode due to cycles in graph');
                  }
                }}
                style={{
                  opacity: currentHasCycles && clusteringMode === 'dag' ? 0.6 : 1,
                  cursor: 'pointer'
                }}
              >
                <span>
                  Layout: {clusteringMode === 'dag' ? 'Hierarchical (DAG)' : 'Force Layout'}
                  {currentHasCycles && clusteringMode === 'dag' && ' (Cycles detected)'}
                </span>
              </button>
            </div>
            <div className="dropdown-filter">
              <button 
                className="dropdown-button"
                onClick={() => setIsDomainOpen(!isDomainOpen)}
              >
                <span>Domains: {getSelectedText(selectedDomains)}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              {isDomainOpen && (
                <div className="dropdown-content">
                  {domains.map(domain => (
                    <label key={domain} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedDomains.includes(domain)}
                        onChange={() => toggleDomain(domain)}
                      />
                      <span>{domain.charAt(0).toUpperCase() + domain.slice(1)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="dropdown-filter">
              <button 
                className="dropdown-button"
                onClick={() => setIsTypeOpen(!isTypeOpen)}
              >
                <span>Types: {getSelectedText(selectedTypes)}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              {isTypeOpen && (
                <div className="dropdown-content">
                  {types.map(type => (
                    <label key={type} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                      />
                      <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ForceGraphErrorBoundary onError={handleForceGraphError}>
            <ForceGraph2D
              key={`force-graph-${clusteringMode}-${currentHasCycles}`}
              ref={graphRef}
              graphData={graphData}
              nodeId="id"
              nodeLabel="asset_key"
              nodeColor={getNodeColor}
              linkColor={getLinkColor}
              linkWidth={2}
              linkDirectionalArrowLength={6}
              linkDirectionalArrowRelPos={1}
              dagMode={safeDagMode}
              dagLevelDistance={safeDagMode ? 60 : undefined}
              onNodeClick={handleNodeClick}
              onBackgroundClick={handleBackgroundClick}

            />
          </ForceGraphErrorBoundary>
          {selectedNode && (
            <div className="node-details-panel">
              <div className="node-details-content">
                <h3>Node Details</h3>
                <div className="node-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Asset Key:</span>
                    <span className="detail-value">{selectedNode.asset_key}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Domain:</span>
                    <span className="detail-value">{selectedNode.domain}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedNode.type}</span>
                  </div>
                </div>
                <button 
                  className="close-button"
                  onClick={() => setSelectedNode(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRetoolComponent;
