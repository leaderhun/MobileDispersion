import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container,
    Row,
    Col,
    Button,
    Modal,
    Form,
    Table,
    OverlayTrigger,
    Tooltip,
    Dropdown,
    DropdownButton,
} from 'react-bootstrap';
import Graph from 'react-graph-vis';
import * as actions from 'action';

const algorithms = {
    HelpingSync: 0,
    HelpingAsync: 1,
    IndependentAsync: 2,
};

const addNewNodeModalDefault = {
    values: {
        show: false,
        label: '',
    },
    errors: {
        labelError: null,
        labelErrorMessage: null,
    },
}

const editNodeModalDefault = {
    values: {
        show: false,
        node: null,
        edges: [],
    },
    errors: {

    }
}

const randomGraphModalDefault = {
    values: {
        show: false,
        numberOfNodes: 0,
        numberOfEdges: 0,
    },
    errors: {
        numberOfNodesError: null,
        numberOfNodesErrorMessage: null,
        numberOfEdgesError: null,
        numberOfEdgesErrorMessage: null,
    }
}

class Main extends Component {
    state = {
        options: {
            layout: {
                hierarchical: false
            },
            edges: {
                color: "#000000",
                arrows: {
                    to:     {enabled: false, scaleFactor:1, type:'arrow'},
                    middle: {enabled: false, scaleFactor:1, type:'arrow'},
                    from:   {enabled: false, scaleFactor:1, type:'arrow'}
                },
            },
            autoResize: true,
            height: '800px',
            width: '100%'
        },
        events: {
            doubleClick: (event) => {
                let { nodes } = event;
                if (nodes.length == 1) this.toggleEditNodeModal(nodes[0]);
            }
        },
        network: null,
        modals: {
            addNewNodeModal: addNewNodeModalDefault,
            editNodeModal: editNodeModalDefault,
            randomGraphModal: randomGraphModalDefault,
        },
        values: {
            numberOfRobots: 1,
            nodesToStartFrom: '',
            algorithm: 0,
        },
        algorithmIsRunning: false,
        previousRobots: null,
    } 
    
    componentDidMount() {      
        const graph = {
            nodes: [
                    { id: 1, label: 'A' },
                    { id: 2, label: 'B' },
                    { id: 3, label: 'C' },
                    { id: 4, label: 'D' },
                    { id: 5, label: 'E' }
                ],
            edges: [
                    { from: 1, to: 2 },
                    { from: 2, to: 1 },
                    { from: 1, to: 3 },
                    { from: 3, to: 1 },
                    { from: 2, to: 4 },
                    { from: 4, to: 2 },
                    { from: 2, to: 5 },
                    { from: 5, to: 2 },
                    { from: 5, to: 5 }
                ]
        };

        this.props.setGraph(graph);
    }

    startAlgorithm = () => {
        const graph = this.getCompatibleGraph();
        
        this.setState(s => ({
            ...s,
            algorithmIsRunning: true
        }), () => this.props.initAlgorithm(graph, this.state.values.algorithm));
    }

    getCompatibleGraph = () => {
        let nodesForRobots = new Set(this.state.values.nodesToStartFrom.split(';'));
        let robotPerNode = Math.floor(this.state.values.numberOfRobots / nodesForRobots.size);
        let modulo = this.state.values.numberOfRobots % nodesForRobots.size;
        let usedRobots = 0;
        let first = true;

        let result = [];

        this.props.graph.nodes.forEach((node, nI) => {
            let row = node.label + ':';
            let edges = this.props.graph.edges.filter(e => e.from === node.id);

            edges.forEach((e, eI) => {
                let toNode = this.props.graph.nodes.find(x => x.id === e.to);
                row += toNode.label;

                if (eI !== edges.length - 1) {
                    row += ',';
                }
            });

            if (nodesForRobots.has(node.label)) {
                row += ':';
                let ending = robotPerNode + (first ? modulo : 0);
                first = false;

                for (let i = 0; i < ending; i++) {
                    row += (usedRobots + i + 1).toString();

                    if (i !== ending - 1) {
                        row += ',';
                    }
                };

                usedRobots += ending;
            };

            result.push(row);
        });

        return result;
    }

    componentWillReceiveProps(props) {
        if (props.robots && props.robots != this.state.previousRobots) {
            const greenColor = '#39ff14';
            const orangeColor = '#FFA500';
            
            let newGraph = { ...props.graph };
            let newNodes = [];

            newGraph.nodes.forEach(node => {
                let filteredRobot = Object.fromEntries(Object.entries(props.robots).filter(([k,v]) => v.parentNode  === node.label));

                let title = '';
                let color = null;
                Object.keys(filteredRobot).forEach((key, i) => {
                    const rob = filteredRobot[key];

                    if (typeof rob === 'function') return;

                    title += `${key} Robot moving to ${rob.movingTo}<br>speed: ${rob.speed}<br>position: ${rob.currentPosition}<br>----------------<br>`

                    if (i === 0) {
                        color = greenColor;
                    } else {
                        color = orangeColor;
                    }
                });

                title = title === '' ? null : title;

                const newNode = {
                    ...node,
                    title,
                    color,
                };

                newNodes.push(newNode);
            });
            
            newGraph.nodes = newNodes;

            this.setState(s => ({
                ...s,
                previousRobots: props.robots,
            }), () => this.props.setGraph(newGraph));  
        }
    }

    handleIntValueChange = ({target}) => {
        if (this.state.algorithmIsRunning) return;
        
        this.setState((s) => ({
            ...s,
            values: {
                ...s.values,
                [target.name]: parseInt(target.value),
            }
        }));
    }

    handleValueChange = ({target}) => {
        if (this.state.algorithmIsRunning) return;
        
        this.setState((s) => ({
            ...s,
            values: {
                ...s.values,
                nodesToStartFrom: target.value,
            }
        }));
    }

    toggleAddNewNodeModal = () => {
        if (this.state.algorithmIsRunning) return;
        
        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                addNewNodeModal: {
                    values: {
                        ...addNewNodeModalDefault.values,
                        show: !s.modals.addNewNodeModal.values.show
                    },
                    errors: {
                        ...addNewNodeModalDefault.errors,
                    }                   
                },
            },
        }));
    }

    handleNodeLabelChange = ({ target }) => {
        if (this.state.algorithmIsRunning) return;
        
        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                addNewNodeModal: {
                    ...s.modals.addNewNodeModal,
                    values: {
                        ...s.modals.addNewNodeModal.values,
                        label: target.value,
                    },
                },
            },
        }))
    }

    addNewNode = () => {
        const { values, errors } = this.state.modals.addNewNodeModal;
        const graph =  {
            ...this.props.graph,
        };
        let error = false;

        if (values.label === '') {
            errors.labelError = true;
            errors.labelErrorMessage = 'Node label is required';

            error = true;
        } else {
            graph.nodes.forEach(node => {
                if (node.label == values.label) {
                    errors.labelError = true;
                    errors.labelErrorMessage = 'Node label must be unique';
    
                    error = true;
                }
            });
        }     

        if (error) {
            this.setState((s) => ({
                ...s,
                modals: {
                    ...s.modals,
                    addNewNodeModal: {
                        ...s.modals.addNewNodeModal,
                        errors: {
                            ...errors,
                        },
                    },
                },
            }));

            return;
        }

        const newGraphNodes = [...graph.nodes];
        newGraphNodes.push({id: Math.max(...graph.nodes.map(x => x.id)) + 1, label: values.label, title: 'Information will come here'});

        graph.nodes = [...newGraphNodes];

        this.props.setGraph(graph);       
        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                addNewNodeModal: addNewNodeModalDefault,
            }
        }))
    }

    toggleEditNodeModal = (nodeId) => {
        if (this.state.algorithmIsRunning) return;
        
        let edges = [];
        
        this.props.graph.edges.forEach(edge => {
            if (edge.from === nodeId) {
                let edgeNodeObject = this.props.graph.nodes.find(x => x.id === edge.to);
                edges.push(edgeNodeObject);
            }
        });

        let nodeToEdit = null;

        this.props.graph.nodes.forEach(node => {
            if (node.id === nodeId) {
                nodeToEdit = node;
            }
        })

        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                editNodeModal: {
                    ...editNodeModalDefault,
                    values: {
                        ...editNodeModalDefault.values,
                        edges,
                        node: nodeToEdit,
                        show: !s.modals.editNodeModal.values.show,
                    }
                }
            }
        }));
    }

    saveNode = () => {
        const from = this.state.modals.editNodeModal.values.node.id;
        const toArray = this.state.modals.editNodeModal.values.edges.map(x => x.id);

        const graph = {
            ...this.props.graph,
            edges: this.props.graph.edges.filter(x => x.from !== from).filter(x => x.to !== from),
        };

        toArray.forEach(to => {
            graph.edges.push({from, to});
            if (from !== to) graph.edges.push({from: to, to: from});
        });

        this.props.setGraph(graph);
        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                editNodeModal: editNodeModalDefault,
            }
        }));
    }

    deleteNode = () => {
        const nodeId = this.state.modals.editNodeModal.values.node.id;
        const graph = {
            nodes: [],
            edges: [],
        };

        this.props.graph.nodes.forEach(node => {
            if (node.id !== nodeId) {
                graph.nodes.push(node);
            }
        });

        this.props.graph.edges.forEach(edge => {
            if (edge.from !== nodeId && edge.to !== nodeId) {
                graph.edges.push(edge)
            };
        });

        this.props.setGraph(graph);
        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                editNodeModal: editNodeModalDefault,
            }
        }));
    }

    deleteEdge = (edgeId) => {
        const newEdges = [...this.state.modals.editNodeModal.values.edges];
        const index = newEdges.findIndex(x => x.id === edgeId);
        newEdges.splice(index, 1);

        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                editNodeModal: {
                    ...s.modals.editNodeModal,
                    values: {
                        ...s.modals.editNodeModal.values,
                        edges: newEdges,
                    },
                },
            },
        }));
    }

    addEdge = (edge) => {
        const newEdges = [...this.state.modals.editNodeModal.values.edges];
        newEdges.push(edge);

        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                editNodeModal: {
                    ...s.modals.editNodeModal,
                    values: {
                        ...s.modals.editNodeModal.values,
                        edges: newEdges,
                    },
                },
            },
        }));
    }

    getAvailableNodes = () => {
        let nodes = [];
        
        if (this.props.graph) {
            const usedNodes = this.state.modals.editNodeModal.values.edges.map(x => x.id);
            nodes = this.props.graph.nodes.filter(node => !usedNodes.includes(node.id));
        }      

        return nodes;
    }

    toggleNewRandomGraphModal = () => {
        if (this.state.algorithmIsRunning) return;
        
        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                randomGraphModal: {
                    ...randomGraphModalDefault,
                    values: {
                        ...randomGraphModalDefault.values,
                        show: !s.modals.randomGraphModal.values.show,
                    },
                },
            },
        }));
    }

    handleRandomGraphModalValueChange = ({ target }) => {
        if (this.state.algorithmIsRunning) return;
        
        if (isNaN(target.value)) return;
        
        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                randomGraphModal: {
                    ...s.modals.randomGraphModal,
                    values: {
                        ...s.modals.randomGraphModal.values,
                        [target.name]: parseInt(target.value),
                    },
                },
            },
        }))
    }

    generateRandomGraph = () => {
        const { numberOfEdges, numberOfNodes } = this.state.modals.randomGraphModal.values;

        let graph = {
            nodes: [],
            edges: [],
        };

        for (let i = 0; i < numberOfNodes; i++) {
            graph.nodes.push({ id: i + 1, label: (i + 1).toString() });
        }

        for (let i = 1; i < numberOfNodes; i++) {
            let from = i;
            let to = i+1;
            graph.edges.push({from, to});
            graph.edges.push({from: to, to: from});
        }

        for (let i = 0; i < numberOfEdges; i++) {
            let from = Math.floor(Math.random() * (numberOfNodes)) + 1;
            let to = Math.floor(Math.random() * (numberOfNodes)) + 1;

            while(graph.edges.filter(x => x.from === from && x.to === to).length > 0
                || graph.edges.filter(x => x.to === from && x.from === to).length > 0
            ) {
                from = Math.floor(Math.random() * (numberOfNodes)) + 1;
                to = Math.floor(Math.random() * (numberOfNodes)) + 1;
            }

            graph.edges.push({from, to});
            if (from !== to) graph.edges.push({from: to, to: from});
        }

        this.props.setGraph(graph);
        this.setState((s) => ({
            ...s,
            modals: {
                ...s.modals,
                randomGraphModal: randomGraphModalDefault,
            }
        }));
    }

    nextStep = () => {
        if (this.state.algorithmIsRunning) {
            this.props.step(this.state.values.algorithm);
        }
    }

    render() {
        return (
            <>
                <Container className="pt-3">
                    <Row>
                        <Col xs={12}>
                            <h1 className="text-center">Mobile Dispersion</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={9}>
                            <h2 className="text-center pt-3">Graph visualization</h2>
                            { this.props.graph
                                ? (
                                    <Graph
                                        graph={this.props.graph}
                                        options={this.state.options}
                                        events={this.state.events}
                                        getNetwork={network => {
                                            this.setState((s) => ({
                                                ...s,
                                                network,
                                            }));
                                        }}
                                    />
                                ) : null
                            }
                        </Col>
                        <Col xs={3}>
                            <Row className="pt-3 text-center">
                                <h2>Configuration</h2>
                            </Row>
                            <Row className="text-center pt-3">
                                <Button disabled={this.state.algorithmIsRunning} variant="primary" block onClick={this.toggleAddNewNodeModal}>Add new node</Button>
                            </Row>
                            <Row className="text-center pt-3">
                                <Button disabled={this.state.algorithmIsRunning} variant="primary" block onClick={this.toggleNewRandomGraphModal}>Generate random graph</Button>
                            </Row>
                            <Row className="text-center pt-3">
                                <Form.Group controlId="numberOfRobots" style={{ width: '100%' }}>
                                    <Form.Label>Number of robots</Form.Label>
                                    <Form.Control
                                        disabled={this.state.algorithmIsRunning}
                                        value={this.state.values.numberOfRobots}
                                        name="numberOfRobots"
                                        onChange={this.handleIntValueChange}
                                        type="text"
                                        placeholder="Enter the number of robots"
                                    />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>                        
                                <Form.Group controlId="nodesToStartFrom" style={{ width: '100%' }}>
                                    <Form.Label>Starting nodes (delimiter: ';')</Form.Label>
                                    <Form.Control
                                         disabled={this.state.algorithmIsRunning}
                                        value={this.state.values.nodesToStartFrom}
                                        name="nodesToStartFrom"
                                        onChange={this.handleValueChange}
                                        type="text"
                                        placeholder="Starting nodes"
                                    />
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group style={{ width: '100%' }}>
                                    <Form.Label>Algorithm</Form.Label>
                                    <Form.Control
                                        as="select"
                                        disabled={this.state.algorithmIsRunning}
                                        value={this.state.values.algorithm}
                                        onChange={this.handleIntValueChange}
                                        name="algorithm"
                                        id="algorithm"
                                    >
                                        { Object.keys(algorithms).map((key) => {
                                            const value = algorithms[key];

                                            if (typeof value === 'function') return null;

                                            return (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {key}
                                                </option>
                                            );
                                        }) }
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            <Row className="text-center pt-3">
                                <Button disabled={this.state.algorithmIsRunning} variant="primary" block onClick={this.startAlgorithm}>Init</Button>
                            </Row>
                            <Row className="text-center pt-3">
                                <Button disabled={!this.state.algorithmIsRunning} variant="primary" block onClick={this.nextStep}>Next step</Button>
                            </Row>
                            <Row className="text-center pt-3">
                                <Button disabled={!this.state.algorithmIsRunning} variant="primary" block onClick={this.run}>Run</Button>
                            </Row>
                        </Col>
                    </Row>
                </Container>
                <Modal show={this.state.modals.addNewNodeModal.values.show} onHide={this.toggleAddNewNodeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add new node</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form>
                        <Form.Group controlId="nodeLabel">
                            <Form.Label>Label</Form.Label>
                            <Form.Control
                                value={this.state.modals.addNewNodeModal.values.label}
                                onChange={this.handleNodeLabelChange}
                                type="text"
                                isInvalid={this.state.modals.addNewNodeModal.errors.labelError}
                                placeholder="Enter the label of the node"
                            />
                            <Form.Control.Feedback type="invalid">{this.state.modals.addNewNodeModal.errors.labelErrorMessage}</Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                    </Modal.Body>
                    <Modal.Footer className="d-flex justify-content-center">
                        <Button variant="secondary" onClick={this.toggleAddNewNodeModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={this.addNewNode}>
                            Add
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.modals.editNodeModal.values.show} onHide={this.toggleEditNodeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit node: {this.state.modals.editNodeModal.values.node ? this.state.modals.editNodeModal.values.node.label : ''}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DropdownButton
                            className="pb-3"
                            size="sm"
                            variant="primary"
                            title="Add edge"
                            id={`dropdown-button-drop`}
                        >
                            {this.getAvailableNodes().map((node, index) => (
                                <Dropdown.Item onClick={() => this.addEdge(node)} key={index} eventKey={index}>{node.label}</Dropdown.Item>
                            ))}
                        </DropdownButton>
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>To</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.modals.editNodeModal.values.edges.map((edge, index) => (
                                    <tr key={edge.id}>
                                        <th>{index}</th>
                                        <th>{edge.label}</th>
                                        <th>
                                            <OverlayTrigger
                                                key={edge.id}
                                                placement="top"
                                                overlay={
                                                    <Tooltip id={`tooltip-${edge.id}`}>
                                                        Delete
                                                    </Tooltip>
                                                }
                                            >
                                                <i className="fas fa-trash" onClick={() => this.deleteEdge(edge.id)} />
                                            </OverlayTrigger>
                                        </th>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer className="d-flex justify-content-center">
                        <Button variant="secondary" onClick={this.toggleEditNodeModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={this.saveNode}>
                            Save
                        </Button>
                        <Button variant="danger" onClick={this.deleteNode}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.modals.randomGraphModal.values.show} onHide={this.toggleNewRandomGraphModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Generate random graph</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form>
                        <Form.Group controlId="numberOfNodes">
                            <Form.Label>Number of nodes</Form.Label>
                            <Form.Control
                                value={this.state.modals.randomGraphModal.values.numberOfNodes}
                                name="numberOfNodes"
                                onChange={this.handleRandomGraphModalValueChange}
                                type="text"
                                isInvalid={this.state.modals.randomGraphModal.errors.numberOfNodesError}
                                placeholder="Enter the number of nodes"
                            />
                            <Form.Control.Feedback type="invalid">{this.state.modals.randomGraphModal.errors.numberOfNodesErrorMessage}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="numberOfEdges">
                            <Form.Label>Addational number of edges</Form.Label>
                            <Form.Control
                                value={this.state.modals.randomGraphModal.values.numberOfEdges}
                                name="numberOfEdges"
                                onChange={this.handleRandomGraphModalValueChange}
                                type="text"
                                isInvalid={this.state.modals.randomGraphModal.errors.numberOfEdgesError}
                                placeholder="Enter the number of edges"
                            />
                            <Form.Control.Feedback type="invalid">{this.state.modals.randomGraphModal.errors.numberOfEdgesErrorMessage}</Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                    </Modal.Body>
                    <Modal.Footer className="d-flex justify-content-center">
                        <Button variant="secondary" onClick={this.toggleNewRandomGraphModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={this.generateRandomGraph}>
                            Generate
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

const mapStateToProps = state => ({
    graph: state.graph,
    robots: state.robots,
});

const mapDispatchToProps = dispatch => ({
    initAlgorithm: (graph, algorithm) => dispatch(actions.initAlgorithm(graph, algorithm)),
    setGraph: (graph) => dispatch(actions.setGraph(graph)),
    step: (algorithm) => dispatch(actions.step(algorithm))
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);