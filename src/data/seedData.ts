import { Semester, Subject, Note, User } from '../types';

export const INITIAL_SEMESTERS: Semester[] = [
  { id: 1, number: 1, name: 'Semester 1', description: 'Foundations of Computer Science & Engineering Mathematics', totalSubjects: 3, totalNotes: 3 },
  { id: 2, number: 2, name: 'Semester 2', description: 'Core Data Structures, OOP Paradigm & Discrete Structures', totalSubjects: 3, totalNotes: 3 },
  { id: 3, number: 3, name: 'Semester 3', description: 'Systems Architecture, Operating Systems & Networks', totalSubjects: 3, totalNotes: 3 },
  { id: 4, number: 4, name: 'Semester 4', description: 'Web Technologies, Full Stack & Formal Languages', totalSubjects: 2, totalNotes: 2 },
  { id: 5, number: 5, name: 'Semester 5', description: 'Distributed Systems, Cloud Architecture & Machine Learning', totalSubjects: 2, totalNotes: 2 },
  { id: 6, number: 6, name: 'Semester 6', description: 'Advanced Specializations, Security & Capstone Systems', totalSubjects: 1, totalNotes: 1 }
];

export const INITIAL_SUBJECTS: Subject[] = [
  // Semester 1
  { id: 'sub-dbms-1', semesterId: 1, code: 'CS101', name: 'Database Management Systems', description: 'Relational model, SQL queries, Normalization, ACID transactions, and indexing.', credits: 4, color: 'blue' },
  { id: 'sub-cf-1', semesterId: 1, code: 'CS102', name: 'Computer Fundamentals & Architecture', description: 'Von Neumann model, CPU registers, ALU, Memory hierarchy, and binary logic.', credits: 3, color: 'indigo' },
  { id: 'sub-math1-1', semesterId: 1, code: 'MA101', name: 'Engineering Mathematics I', description: 'Multivariable calculus, linear transformations, matrices, and eigenvalues.', credits: 4, color: 'purple' },
  // Semester 2
  { id: 'sub-dsa-2', semesterId: 2, code: 'CS201', name: 'Data Structures & Algorithms', description: 'Linear & non-linear data structures, trees, graphs, sorting, and complexity analysis.', credits: 4, color: 'emerald' },
  { id: 'sub-oop-2', semesterId: 2, code: 'CS202', name: 'Object-Oriented Programming', description: 'Encapsulation, inheritance, polymorphism, abstract classes, and design patterns in Java/C++.', credits: 4, color: 'teal' },
  { id: 'sub-dm-2', semesterId: 2, code: 'MA201', name: 'Discrete Mathematics', description: 'Set theory, propositional logic, boolean algebra, graph theory, and relations.', credits: 3, color: 'cyan' },
  // Semester 3
  { id: 'sub-os-3', semesterId: 3, code: 'CS301', name: 'Operating Systems', description: 'Process management, CPU scheduling, semaphores, deadlock detection, and virtual memory.', credits: 4, color: 'amber' },
  { id: 'sub-cn-3', semesterId: 3, code: 'CS302', name: 'Computer Networks', description: 'OSI 7-layer model, TCP/IP protocol suite, routing algorithms, DNS, and socket programming.', credits: 4, color: 'orange' },
  { id: 'sub-se-3', semesterId: 3, code: 'CS303', name: 'Software Engineering', description: 'Agile methodologies, UML diagrams, architectural styles, software testing, and CI/CD pipelines.', credits: 3, color: 'rose' },
  // Semester 4
  { id: 'sub-web-4', semesterId: 4, code: 'CS401', name: 'Web Technologies & Full Stack', description: 'Client-server architecture, modern React.js, Node.js runtime, RESTful APIs, and state management.', credits: 4, color: 'violet' },
  { id: 'sub-toc-4', semesterId: 4, code: 'CS402', name: 'Theory of Computation', description: 'Deterministic & Non-deterministic Finite Automata, Regular Grammars, CFGs, and Turing Machines.', credits: 3, color: 'fuchsia' },
  // Semester 5
  { id: 'sub-cloud-5', semesterId: 5, code: 'CS501', name: 'Cloud Computing & Microservices', description: 'Virtualization, container orchestration with Kubernetes, Docker, and serverless architectures.', credits: 3, color: 'sky' },
  { id: 'sub-ai-5', semesterId: 5, code: 'CS502', name: 'Machine Learning & AI', description: 'Supervised and unsupervised learning, gradient descent, neural networks, and prompt engineering.', credits: 4, color: 'pink' }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-dbms-unit1',
    title: 'Unit 1 & 2: Relational Models, SQL & Normalization Mastery',
    semesterId: 1,
    subjectId: 'sub-dbms-1',
    subjectCode: 'CS101',
    subjectName: 'Database Management Systems',
    unit: 'Unit 1 & 2',
    description: 'Comprehensive college lecture notes covering Entity-Relationship diagrams, Relational Algebra, SQL joins, and 1NF through BCNF normalization with solved exam problems.',
    author: 'Prof. Alan Sharma',
    uploadDate: '2026-03-10',
    fileSize: '2.4 MB',
    totalPages: 5,
    downloads: 342,
    views: 890,
    rating: 4.9,
    tags: ['DBMS', 'SQL', 'Normalization', 'Relational Algebra', 'ACID'],
    pages: [
      {
        pageNumber: 1,
        title: 'Introduction to Database Management Systems & Architecture',
        content: `A Database Management System (DBMS) is specialized system software that allows users to create, maintain, query, and administer structured collections of data.

Three-Schema Architecture (ANSI/SPARC):
1. Physical / Internal Level: Describes physical storage structures, indexing mechanisms (B-Trees, Hash files), and record clustering on disk.
2. Conceptual / Logical Level: Defines the community view of the entire database—entities, data types, relationships, constraints, and security definitions without hardware details.
3. External / View Level: Tailored sub-schemas accessible to individual end-users or applications, enforcing strict data isolation and principle of least privilege.

Key Data Independence Principles:
- Logical Data Independence: Capacity to modify the conceptual schema without altering existing external views or rewrite user application programs.
- Physical Data Independence: Capacity to change the physical storage structures (e.g., adding indexes or moving storage disks) without changing the logical schema.`,
        keyPoints: [
          'DBMS eliminates redundant storage, data inconsistencies, and provides atomic transactions.',
          'ANSI/SPARC three-tier architecture decouples user applications from physical disk layouts.',
          'Data abstraction levels: Physical (Lowest) -> Conceptual -> View (Highest).'
        ],
        diagramTitle: 'Three-Schema Architecture Hierarchy'
      },
      {
        pageNumber: 2,
        title: 'Entity-Relationship (E-R) Modeling & Mapping to Relational Tables',
        content: `The ER model forms the conceptual foundation for database design prior to logical schema implementation.

Core Notations & Symbols:
- Entity: Rectangles represent real-world objects with independent existence (e.g., Student, Course).
- Weak Entity: Double rectangles represent entities lacking a primary key of their own, depending on an identifying owner entity via a total identifying relationship (Double Diamond).
- Attribute: Ellipses denote entity properties. Underlined text indicates the Primary Key candidate; Double ellipses represent Multivalued attributes (e.g., phone_numbers); Dashed ellipses represent Derived attributes (e.g., age computed from date_of_birth).
- Relationship: Diamonds connect entities with cardinality ratios (1:1, 1:N, M:N) and participation constraints (Total vs Partial).

Algorithmic Mapping to Tables:
1. Regular Entity: Map to a distinct table with simple attributes.
2. 1:N Relationship: Place the primary key of the '1' side into the 'N' side table as a Foreign Key.
3. M:N Relationship: Create a composite bridge table containing foreign keys from both participating entities as a combined primary key.
4. Multivalued Attribute: Generate a separate table with the parent entity's Primary Key plus the attribute value.`,
        keyPoints: [
          'Weak entities require an identifying relationship and borrow the owner entity key.',
          'Many-to-Many (M:N) relationships ALWAYS require an intermediate junction table.',
          'Derived attributes are calculated dynamically and should never be stored physically.'
        ]
      },
      {
        pageNumber: 3,
        title: 'Relational Algebra & Foundational SQL Operations',
        content: `Relational Algebra is a procedural formal query language that operates on one or two relations and returns a new relation as output.

Fundamental Operators:
1. Selection (σ_condition(R)): Filters tuples satisfying predicate condition. (Corresponds to SQL WHERE).
2. Projection (π_attributes(R)): Selects specific columns and removes duplicate rows. (Corresponds to SQL SELECT).
3. Cartesian Product (R × S): Pairs every tuple in R with every tuple in S.
4. Set Union (R ∪ S), Difference (R - S), Intersection (R ∩ S): Requires Union-Compatibility (same degree and matching domain data types).
5. Natural Join (R ⋈ S): Combines selection and projection over shared column names.

Practical SQL Implementation:
SELECT S.student_name, C.course_name, E.grade
FROM Students S
INNER JOIN Enrollments E ON S.student_id = E.student_id
INNER JOIN Courses C ON E.course_id = C.course_id
WHERE E.grade >= 'B'
ORDER BY S.student_name ASC;`,
        keyPoints: [
          'Selection filters rows horizontally; Projection filters columns vertically.',
          'Natural join combines matching tuples on identically named attributes.',
          'SQL declarative queries compile internally into relational algebra operator trees.'
        ],
        codeSnippet: `SELECT department_id, AVG(salary) AS avg_sal
FROM Professors
GROUP BY department_id
HAVING COUNT(*) >= 5;`
      },
      {
        pageNumber: 4,
        title: 'Functional Dependencies & Normalization (1NF to BCNF)',
        content: `Normalization is the systematic process of decomposing database tables to eliminate data redundancy, update anomalies, insertion anomalies, and deletion anomalies.

Functional Dependency (X -> Y):
Attribute set X uniquely determines attribute set Y in relation R if whenever two tuples agree on X, they must agree on Y.

Normal Form Hierarchy:
- First Normal Form (1NF): Each column contains only atomic (indivisible) values. No repeating groups or arrays.
- Second Normal Form (2NF): Must be in 1NF, and NO non-prime attribute is partially functionally dependent on any candidate key (Eliminate partial dependencies).
- Third Normal Form (3NF): Must be in 2NF, and NO non-prime attribute is transitively dependent on candidate key. Formally, for every non-trivial X -> A:
  - Either X is a Super Key, OR
  - A is a Prime Attribute (member of some candidate key).
- Boyce-Codd Normal Form (BCNF): Stricter version of 3NF. For every non-trivial functional dependency X -> A, X MUST be a Super Key (No exceptions for prime attributes).`,
        keyPoints: [
          '1NF enforces atomicity of values (no lists/arrays in columns).',
          '2NF eliminates partial dependency on composite candidate keys.',
          '3NF eliminates transitive dependencies (X -> Y and Y -> Z).',
          'BCNF requires the determinant of every non-trivial dependency to be a super key.'
        ]
      },
      {
        pageNumber: 5,
        title: 'Transaction Management & ACID Properties',
        content: `A database transaction is a logical unit of work consisting of one or more database operations (READ, WRITE) that must execute as an indivisible whole.

The ACID Contract:
1. Atomicity: "All or Nothing." If any operation within a transaction fails, the entire transaction is rolled back to its pre-transaction state via the Write-Ahead Log (WAL).
2. Consistency: A transaction must transform the database from one valid consistent state satisfying all integrity constraints (Foreign keys, CHECK clauses) to another.
3. Isolation: Concurrent execution of transactions must leave the system in a state identical to some serial execution sequence. Enforced by Two-Phase Locking (2PL) and Multi-Version Concurrency Control (MVCC).
4. Durability: Once a transaction commits, its effects persist permanently on non-volatile media, even in the event of immediate hardware crash or power loss.

Concurrency Anomalies:
- Dirty Read: Reading uncommitted data written by another active transaction.
- Non-Repeatable Read: Reading different values on repeated reads within the same transaction because another transaction updated and committed the row.
- Phantom Read: New rows appearing in range queries because another transaction inserted rows satisfying the search filter.`,
        keyPoints: [
          'Atomicity is managed by undo logging / rollback logs.',
          'Isolation levels: Read Uncommitted < Read Committed < Repeatable Read < Serializable.',
          'Durability relies on redundant write-ahead logging (WAL) to disk.'
        ]
      }
    ]
  },
  {
    id: 'note-cf-unit1',
    title: 'Unit 1: Von Neumann Architecture, Memory Hierarchy & Digital Logic',
    semesterId: 1,
    subjectId: 'sub-cf-1',
    subjectCode: 'CS102',
    subjectName: 'Computer Fundamentals & Architecture',
    unit: 'Unit 1',
    description: 'Detailed lecture notes on Von Neumann vs Harvard architecture, CPU registers, instruction execution cycles, cache mapping techniques, and binary arithmetic.',
    author: 'Dr. Rebecca Chen',
    uploadDate: '2026-03-12',
    fileSize: '1.8 MB',
    totalPages: 3,
    downloads: 215,
    views: 640,
    rating: 4.8,
    tags: ['Architecture', 'Von Neumann', 'CPU', 'Registers', 'Cache'],
    pages: [
      {
        pageNumber: 1,
        title: 'Von Neumann Architecture & The Stored-Program Concept',
        content: `The Von Neumann Architecture is the theoretical foundation of contemporary general-purpose computers, characterized by the Stored-Program Concept where program instructions and data share the same unified memory space.

Key Architectural Blocks:
1. Central Processing Unit (CPU):
   - Arithmetic Logic Unit (ALU): Executes arithmetic operations (addition, subtraction) and bitwise boolean logic (AND, OR, XOR).
   - Control Unit (CU): Decodes instructions, manages micro-operations, and coordinates the datapath via clock synchronization pulses.
   - Internal Registers: Ultra-fast temporary flip-flop storage inside the core (PC, IR, MAR, MDR, Accumulator).
2. Primary Memory (RAM): Unified byte-addressable linear storage.
3. Input/Output Interfaces: Bridges CPU and peripheral devices via bus controllers.

The Von Neumann Bottleneck:
Because instructions and data share the common system bus, throughput is strictly constrained by memory bus bandwidth—the CPU cannot read an instruction and read/write data simultaneously. Modern processors mitigate this with split L1 caches (L1 Instruction and L1 Data).`,
        keyPoints: [
          'Unified memory for program code and data is the hallmark of Von Neumann design.',
          'Harvard architecture separates instruction bus and data bus to prevent bus contention.',
          'CPU registers operate within a fraction of a single clock cycle (<1 ns).'
        ]
      },
      {
        pageNumber: 2,
        title: 'Instruction Cycle: Fetch, Decode, Execute, and Memory Registers',
        content: `Every instruction executed by a microprocessor passes through a systematic sequence called the Instruction Cycle.

Detailed Sub-Phases:
1. Fetch Cycle:
   - Program Counter (PC) holds memory address of the next instruction.
   - Address in PC is placed onto Memory Address Register (MAR).
   - Control Unit pulses the Read signal onto the memory bus.
   - Instruction byte arrives at Memory Data Register (MDR) and is copied to Instruction Register (IR).
   - PC increments to point to the subsequent sequential instruction.
2. Decode Cycle:
   - Control Unit decodes opcode bits in the IR, identifying required operands and addressing modes.
3. Execute Cycle:
   - ALU executes the operation (e.g., ADD R1, R2). Status register flags (Zero, Carry, Negative, Overflow) are updated.
4. Interrupt Check:
   - Evaluates hardware interrupt line before fetching next instruction.`,
        keyPoints: [
          'PC -> MAR -> Memory Bus -> MDR -> IR pipeline.',
          'Addressing modes: Immediate, Direct, Indirect, Register, Indexed.',
          'Pipelining allows overlapping execution of multiple instruction phases.'
        ]
      },
      {
        pageNumber: 3,
        title: 'Memory Hierarchy & Cache Memory Organization',
        content: `The memory hierarchy balances capacity, latency, and cost per bit across computing subsystems.

Hierarchy Levels (Fastest/Costliest to Slowest/Cheapest):
1. CPU Registers: 32-64 registers, <0.5 ns latency.
2. L1 Cache: 32-64 KB per core, ~1 ns latency (Split into Instruction & Data).
3. L2 Cache: 512 KB - 1 MB per core, ~3-5 ns latency.
4. L3 Cache: Shared 16-64 MB across cores, ~10-15 ns latency.
5. Main Memory (DRAM): 8-64 GB, ~50-80 ns latency.
6. Secondary Storage (NVMe SSD / HDD): 512 GB - 4 TB, microseconds to milliseconds.

Cache Mapping Techniques:
- Direct-Mapped Cache: Each memory block maps to exactly one cache line (Index = Address % CacheLines). Simple, fast, but high collision/conflict misses.
- Fully Associative Cache: A memory block can reside in any cache line. Eliminates conflict misses, but requires expensive parallel comparator hardware.
- Set-Associative Cache: Compromise (e.g., 4-way, 8-way). Cache divided into sets, each containing k lines.`,
        keyPoints: [
          'Principle of Locality: Temporal (re-used soon) and Spatial (nearby items accessed).',
          'Cache Hit Ratio = Hits / (Hits + Misses). Average Memory Access Time (AMAT) = Hit Time + (Miss Rate * Miss Penalty).',
          'Replacement policies: LRU (Least Recently Used), FIFO, Random.'
        ]
      }
    ]
  },
  {
    id: 'note-math-unit1',
    title: 'Unit 1: Linear Algebra, Eigenvalues & Matrix Diagonalization',
    semesterId: 1,
    subjectId: 'sub-math1-1',
    subjectCode: 'MA101',
    subjectName: 'Engineering Mathematics I',
    unit: 'Unit 1 & 2',
    description: 'Comprehensive college math notes on system of linear equations, rank of matrix, Cayley-Hamilton theorem, Eigenvalues, Eigenvectors, and orthogonal diagonalization.',
    author: 'Prof. K. Ramanujan',
    uploadDate: '2026-03-05',
    fileSize: '3.1 MB',
    totalPages: 3,
    downloads: 180,
    views: 520,
    rating: 4.7,
    tags: ['Mathematics', 'Matrices', 'Eigenvalues', 'Linear Algebra'],
    pages: [
      {
        pageNumber: 1,
        title: 'Systems of Linear Equations, Row Operations & Rank of Matrix',
        content: `A system of m linear equations in n variables can be written compactly as AX = B, where A is the m×n coefficient matrix, X is the column vector of variables, and B is the constant vector.

Row Echelon Form (REF) & Reduced Row Echelon Form (RREF):
A matrix is in REF if:
1. All zero rows are at the bottom.
2. The leading entry of each non-zero row is to the right of the leading entry of the row above it.
3. In RREF, each leading entry is 1 and is the only non-zero entry in its column.

Rouché-Capelli Theorem (Consistency Test):
Given augmented matrix [A|B]:
- If rank(A) ≠ rank([A|B]), the system is Inconsistent (No solution).
- If rank(A) = rank([A|B]) = n (number of unknowns), system has a Unique Solution.
- If rank(A) = rank([A|B]) = r < n, system has Infinitely Many Solutions with (n - r) free parameters.`,
        keyPoints: [
          'Elementary row operations preserve the solution space of the linear system.',
          'Rank is the count of non-zero rows in its Row Echelon Form.',
          'Gaussian Elimination reduces [A|B] to REF; Gauss-Jordan reduces to RREF.'
        ]
      },
      {
        pageNumber: 2,
        title: 'Eigenvalues, Eigenvectors & Characteristic Polynomial',
        content: `Let A be an n×n square matrix. A non-zero vector v is called an Eigenvector of A corresponding to scalar eigenvalue λ if:
A v = λ v, or equivalently (A - λ I) v = 0.

Characteristic Equation:
Since v is a non-zero vector, the matrix (A - λ I) must be singular:
det(A - λ I) = 0.
This polynomial equation of degree n yields up to n eigenvalues (real or complex).

Fundamental Properties of Eigenvalues:
1. The sum of the eigenvalues of A equals the Trace of A (sum of main diagonal entries).
2. The product of the eigenvalues of A equals the Determinant of A.
3. If A is triangular or diagonal, its eigenvalues are simply the entries on the main diagonal.
4. A is invertible if and only if 0 is NOT an eigenvalue of A.`,
        keyPoints: [
          'det(A - λ I) = 0 is the characteristic equation.',
          'Sum of eigenvalues = Tr(A); Product of eigenvalues = det(A).',
          'Eigenvectors corresponding to distinct eigenvalues are linearly independent.'
        ]
      },
      {
        pageNumber: 3,
        title: 'Cayley-Hamilton Theorem & Matrix Diagonalization',
        content: `The Cayley-Hamilton Theorem states that every square matrix A satisfies its own characteristic polynomial equation.
If the characteristic equation is:
P(λ) = λ^n + c_{n-1} λ^{n-1} + ... + c_1 λ + c_0 = 0,
then:
A^n + c_{n-1} A^{n-1} + ... + c_1 A + c_0 I = O.

Direct Applications:
1. Finding Matrix Inverse:
   Multiply the equation by A^{-1}:
   A^{-1} = -1/c_0 [ A^{n-1} + c_{n-1} A^{n-2} + ... + c_1 I ]
2. Computing High Powers of Matrices:
   Allows expressing A^k (for k ≥ n) as a linear combination of I, A, A^2, ..., A^{n-1}.

Matrix Diagonalization:
An n×n matrix A is diagonalizable if there exists an invertible modal matrix P whose columns are n linearly independent eigenvectors of A, such that:
P^{-1} A P = D, where D is the diagonal matrix containing the eigenvalues.`,
        keyPoints: [
          'Cayley-Hamilton enables computing high matrix powers and inverses without determinants.',
          'A matrix is diagonalizable if and only if geometric multiplicity equals algebraic multiplicity for each eigenvalue.',
          'Symmetric real matrices are always orthogonally diagonalizable.'
        ]
      }
    ]
  },
  {
    id: 'note-dsa-unit2',
    title: 'Unit 2: Binary Search Trees, AVL Self-Balancing & Graph Traversals',
    semesterId: 2,
    subjectId: 'sub-dsa-2',
    subjectCode: 'CS201',
    subjectName: 'Data Structures & Algorithms',
    unit: 'Unit 2 & 3',
    description: 'Lecture notes with time complexity derivations, AVL tree rotations (LL, RR, LR, RL), BFS vs DFS traversals, and Dijkstra shortest path algorithm.',
    author: 'Prof. Marcus Vance',
    uploadDate: '2026-03-01',
    fileSize: '2.9 MB',
    totalPages: 4,
    downloads: 412,
    views: 1120,
    rating: 4.9,
    tags: ['DSA', 'Trees', 'AVL', 'Graphs', 'Algorithms', 'BFS', 'DFS'],
    pages: [
      {
        pageNumber: 1,
        title: 'Binary Search Trees (BST) & Complexity Degradation',
        content: `A Binary Search Tree (BST) is a hierarchical node-based data structure satisfying the BST Property:
For every node N:
- Keys in left subtree < key(N)
- Keys in right subtree > key(N)
- Both left and right subtrees must themselves be valid BSTs.

Standard Operations:
- Inorder Traversal: Left -> Root -> Right (Yields elements in strictly sorted ascending order).
- Search(k): Compare k with root; branch left if k < key, right if k > key.
- Deletion:
  Case 1: Leaf node -> simply remove.
  Case 2: Node with 1 child -> link parent directly to child.
  Case 3: Node with 2 children -> replace node key with its Inorder Successor (minimum node in right subtree) and delete successor.

Skewed BST Problem:
When elements are inserted in already-sorted order (1, 2, 3, 4, 5), BST degenerates into a singly linked list with O(N) worst-case search time instead of O(log N). This necessitates Self-Balancing Trees like AVL and Red-Black trees.`,
        keyPoints: [
          'Inorder traversal of a BST produces sorted output.',
          'Average search time is O(log N); Worst case for degenerate tree is O(N).',
          'Self-balancing mechanisms ensure O(log N) height guarantee.'
        ]
      },
      {
        pageNumber: 2,
        title: 'AVL Trees & The Four Balancing Rotations',
        content: `An AVL (Adelson-Velsky and Landis) Tree is a strictly balanced binary search tree where the Balance Factor (BF) of every node must belong to {-1, 0, +1}.
Balance Factor: BF(N) = Height(Left Subtree) - Height(Right Subtree).

Four Rebalancing Rotations:
1. LL Imbalance (Left of Left): Single Right Rotation about parent node.
2. RR Imbalance (Right of Right): Single Left Rotation about parent node.
3. LR Imbalance (Right of Left): Double Rotation -> Left Rotation on child, then Right Rotation on parent.
4. RL Imbalance (Left of Right): Double Rotation -> Right Rotation on child, then Left Rotation on parent.

Height Guarantee:
An AVL tree with N nodes has height strictly bounded by h < 1.44 log_2(N + 2). Thus, Search, Insertion, and Deletion are all guaranteed strictly O(log N).`,
        keyPoints: [
          'Balance Factor must be in {-1, 0, +1}.',
          'Single rotations fix outer imbalances (LL, RR); Double rotations fix inner imbalances (LR, RL).',
          'Guarantees strict O(log N) worst-case time complexity.'
        ]
      },
      {
        pageNumber: 3,
        title: 'Graph Representation & Systematic Traversals (BFS vs DFS)',
        content: `A Graph G = (V, E) comprises vertices V and edges E connecting pairs of vertices.

Representations:
- Adjacency Matrix: 2D array of size |V| × |V|. O(1) edge lookup, but O(|V|^2) space complexity (wasteful for sparse graphs).
- Adjacency List: Array of linked lists or dynamic vectors. Space complexity is optimal O(|V| + |E|).

Traversals:
1. Breadth-First Search (BFS):
   - Uses a FIFO Queue.
   - Explores neighbor vertices level-by-level starting from source vertex.
   - Computes Shortest Path in unweighted graphs.
   - Time Complexity: O(|V| + |E|).
2. Depth-First Search (DFS):
   - Uses a LIFO Stack or recursion call stack.
   - Explores as deeply as possible along each branch before backtracking.
   - Used in Topological Sorting, Cycle Detection, and Strongly Connected Components (Tarjan / Kosaraju).
   - Time Complexity: O(|V| + |E|).`,
        keyPoints: [
          'BFS uses Queue (Level-order / shortest paths in unweighted graphs).',
          'DFS uses Stack / Recursion (Cycle detection, topological sort).',
          'Both visit every vertex and edge in O(V + E) time with adjacency lists.'
        ]
      },
      {
        pageNumber: 4,
        title: 'Dijkstra Single-Source Shortest Path Algorithm',
        content: `Dijkstra's Algorithm finds the shortest path from a starting source vertex s to all other vertices in a weighted, directed or undirected graph with NON-NEGATIVE edge weights.

Algorithmic Steps:
1. Initialize distance array: dist[s] = 0, dist[v] = ∞ for all v ≠ s.
2. Insert all vertices into a Min-Priority Queue (Binary Min-Heap) keyed on dist[v].
3. While Priority Queue is not empty:
   - Extract vertex u with minimum dist[u].
   - For each adjacent neighbor v of u:
     Relaxation Step:
     if dist[u] + weight(u, v) < dist[v]:
       dist[v] = dist[u] + weight(u, v)
       decreaseKey(v, dist[v])
       parent[v] = u

Complexity:
- Using standard binary min-heap: O((|V| + |E|) log |V|).
- With Fibonacci Heap: O(|E| + |V| log |V|).
Important Constraint: Fails on graphs with negative edge weights (Bellman-Ford algorithm must be used instead).`,
        keyPoints: [
          'Dijkstra uses greedy relaxation with a min-priority queue.',
          'Does not support negative edge weights (use Bellman-Ford for negative edges).',
          'Time complexity is O((V + E) log V) with binary heap.'
        ]
      }
    ]
  },
  {
    id: 'note-os-unit1',
    title: 'Unit 1 & 2: Process Scheduling, Synchronization & Deadlocks',
    semesterId: 3,
    subjectId: 'sub-os-3',
    subjectCode: 'CS301',
    subjectName: 'Operating Systems',
    unit: 'Unit 1 & 2',
    description: 'College OS notes covering PCB, Process States, CPU scheduling (FCFS, SJF, Round Robin), Semaphores, Critical Section Problem, and Banker Algorithm for Deadlock Avoidance.',
    author: 'Prof. Alan Sharma',
    uploadDate: '2026-02-28',
    fileSize: '2.5 MB',
    totalPages: 3,
    downloads: 388,
    views: 950,
    rating: 4.9,
    tags: ['OS', 'Processes', 'Scheduling', 'Deadlock', 'Semaphores'],
    pages: [
      {
        pageNumber: 1,
        title: 'Process Control Block (PCB) & CPU Scheduling Algorithms',
        content: `A Process is a program in active execution. The Operating System represents each process via a Process Control Block (PCB) kernel structure.

PCB Components: Process ID (PID), Process State (New, Ready, Running, Waiting, Terminated), Program Counter, CPU Registers, Memory Limits, and Open File Descriptors.

CPU Scheduling Criteria:
- Turnaround Time (TAT): Completion Time - Arrival Time.
- Waiting Time (WT): Turnaround Time - Burst Time.
- Response Time: Time from submission to first CPU execution.

Common Scheduling Algorithms:
1. First-Come, First-Served (FCFS): Non-preemptive. Suffers from Convoy Effect where short processes wait behind long CPU-bound tasks.
2. Shortest Job First (SJF / SRTF): Provably optimal average waiting time. Preemptive variant is Shortest Remaining Time First. Vulnerable to process starvation.
3. Round Robin (RR): Preemptive with a fixed time quantum q. Ensures fair responsiveness. If q is too large -> acts like FCFS; if q is too small -> massive context-switch overhead.`,
        keyPoints: [
          'Context switching incurs CPU cycle overhead storing and loading PCB state.',
          'SJF minimizes average waiting time but requires prior knowledge of burst duration.',
          'Round Robin time quantum selection directly governs throughput and responsiveness.'
        ]
      },
      {
        pageNumber: 2,
        title: 'The Critical Section Problem & Semaphores',
        content: `A race condition occurs when multiple threads concurrently access and manipulate shared data, where the final result depends on the non-deterministic order of execution.

Three Mandatory Criteria for Critical Section Solutions:
1. Mutual Exclusion: If process Pi is executing in its critical section, no other process may be in their critical section.
2. Progress: If no process is in critical section and some wish to enter, selection cannot be postponed indefinitely by processes outside the entry section.
3. Bounded Waiting: There exists a bound on the number of times other processes are allowed to enter after a process has requested entry.

Semaphores (Dijkstra):
An integer variable S accessed solely via two atomic operations:
1. wait(S) or P(S):
   while (S <= 0); // busy wait (or sleep in block-based semaphores)
   S--;
2. signal(S) or V(S):
   S++;

Types:
- Binary Semaphore (Mutex): S is restricted to 0 or 1.
- Counting Semaphore: S initializes to available count of resource instances.`,
        keyPoints: [
          'Critical Section requires Mutual Exclusion, Progress, and Bounded Waiting.',
          'Counting semaphores manage finite pool of shared resources.',
          'Deadlock or Priority Inversion can occur with naive semaphore locking.'
        ]
      },
      {
        pageNumber: 3,
        title: 'Deadlock Characterization & The Banker Algorithm',
        content: `A Deadlock is a permanent stagnation state where every process in a set is waiting for an event (resource release) that can only be caused by another process in the set.

Four Necessary Coffman Conditions:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process holding at least one resource is actively requesting additional resources held by other processes.
3. No Preemption: Resources cannot be forcibly revoked from a process holding them; they must be voluntarily released upon completion.
4. Circular Wait: A closed chain of processes P0, P1, ..., Pn exists such that P0 waits for a resource held by P1, ..., and Pn waits for P0.

Deadlock Avoidance: Banker's Algorithm (Dijkstra):
Maintains state safety:
- Allocation Matrix: Current resources held by each process.
- Max Matrix: Maximum demand of each process.
- Need Matrix: Need[i][j] = Max[i][j] - Allocation[i][j].
- Available Vector: Free unallocated instances of each resource type.

Safety Algorithm searches for a Safe Sequence <P1, P2, ... Pn> such that for every Pi, Need[i] <= Available + sum(Allocation of earlier finished processes). If such sequence exists, system is SAFE; otherwise request is rejected.`,
        keyPoints: [
          'Deadlock requires ALL FOUR Coffman conditions simultaneously.',
          'Banker algorithm checks if granting a request maintains at least one valid safe sequence.',
          'Safe state implies no deadlock; Unsafe state does not guarantee deadlock, but risk exists.'
        ]
      }
    ]
  },
  {
    id: 'note-web-unit1',
    title: 'Unit 1: Modern Full Stack Architecture with React, Node & REST',
    semesterId: 4,
    subjectId: 'sub-web-4',
    subjectCode: 'CS401',
    subjectName: 'Web Technologies & Full Stack',
    unit: 'Unit 1 & 2',
    description: 'Lecture notes covering React Virtual DOM, Hooks (useState, useEffect, useMemo), Express middleware design, RESTful design principles, and JWT authentication flow.',
    author: 'Prof. Sarah Lin',
    uploadDate: '2026-02-20',
    fileSize: '2.1 MB',
    totalPages: 3,
    downloads: 320,
    views: 870,
    rating: 4.8,
    tags: ['Web', 'React', 'Node.js', 'Express', 'JWT', 'REST'],
    pages: [
      {
        pageNumber: 1,
        title: 'The React Virtual DOM & Reconciliation Engine',
        content: `Traditional DOM manipulation is computationally expensive because layout recalculations and repaints trigger across document trees on individual node mutations.

React Virtual DOM (VDOM):
A lightweight in-memory JavaScript representation of the actual DOM tree.
When state changes in a React component:
1. React produces a new Virtual DOM tree representing the updated UI.
2. Diffing Algorithm (Reconciliation / Fiber):
   React compares the newly generated tree with the previous snapshot using an efficient O(N) heuristic algorithm based on two key assumptions:
   - Two elements of different types will produce different trees.
   - The developer can hint at which child elements are stable across renders with a key prop.
3. Batching & Patching:
   Calculates the minimal set of real DOM mutations and applies them in a single batch, minimizing layout thrashing.`,
        keyPoints: [
          'Virtual DOM minimizes direct browser DOM re-paints through batching.',
          'Keys in lists enable the reconciliation engine to match existing nodes instead of recreating.',
          'React Fiber allows splitting rendering work into incremental chunks.'
        ]
      },
      {
        pageNumber: 2,
        title: 'Express.js Middleware Architecture & RESTful API Principles',
        content: `Express.js is a minimalist web framework for Node.js organized around a pipeline of Middleware Functions.

Middleware Signature: (req, res, next) => { ... }
Capabilities:
- Execute arbitrary code.
- Mutate req and res objects (e.g., req.user = decodedToken).
- Terminate the request-response cycle (res.json(...)).
- Call next() to delegate control to the next middleware in chain.

REST (Representational State Transfer) Constraints:
1. Client-Server Separation: UI concerns decoupled from data storage.
2. Statelessness: Every request from client to server must contain all information required to understand and process the request. No session state on server.
3. Cacheability: Responses must implicitly or explicitly define themselves as cacheable or non-cacheable.
4. Uniform Interface: Resource identification via standard URI nouns (e.g., /api/notes), standard HTTP verbs (GET, POST, PUT, DELETE).`,
        keyPoints: [
          'Middleware chains process requests sequentially until response is dispatched.',
          'REST endpoints use plural nouns for resources (e.g. /api/students, /api/notes).',
          'HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found).'
        ]
      },
      {
        pageNumber: 3,
        title: 'Authentication & Security: JWT vs Session-Based Auth',
        content: `Stateless authentication is preferred for modern distributed architectures and single-page applications.

JSON Web Token (JWT) Structure:
A compact URL-safe string composed of three dot-separated Base64Url-encoded segments:
1. Header: { "alg": "HS256", "typ": "JWT" }
2. Payload: Claims such as sub (subject ID), role, exp (expiration time), and custom profile metadata.
3. Signature: HMACSHA256(base64Url(Header) + "." + base64Url(Payload), secretKey).

Authentication Workflow:
1. Client submits credentials (email, password) via POST /api/auth/login.
2. Server verifies bcrypt hash match against database.
3. Server signs and issues JWT to client.
4. Client stores JWT (e.g. in secure memory or httpOnly cookie) and attaches it in the Authorization header:
   Authorization: Bearer <token>
5. Middleware parses header, verifies cryptographic signature using server secret, and sets req.user without database lookup.`,
        keyPoints: [
          'JWT consists of Header, Payload, and Signature.',
          'Stateless token verification removes the need to store session keys in a centralized Redis cache.',
          'Passwords must always be hashed with bcrypt / argon2 with salt.'
        ]
      }
    ]
  }
];

export const DEMO_STUDENT: User = {
  id: 'usr-student-1',
  name: 'Sarah Jenkins',
  email: 'student@campus.edu',
  role: 'student',
  studentId: 'CS2026-0842',
  department: 'Computer Science & Engineering',
  semester: 3,
  bookmarks: ['note-dbms-unit1', 'note-os-unit1'],
  quizStats: {
    completed: 4,
    avgScore: 88,
    lastScore: 90
  }
};

export const DEMO_ADMIN: User = {
  id: 'usr-admin-1',
  name: 'Prof. Alan Sharma',
  email: 'admin@campus.edu',
  role: 'admin',
  teacherId: 'FAC-CS-101',
  department: 'Faculty of Computer Science',
  bookmarks: [],
  quizStats: {
    completed: 0,
    avgScore: 0
  }
};
