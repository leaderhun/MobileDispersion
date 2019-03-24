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

    componentWillReceiveProps(props) {
        console.log(props);
    }

    toggleAddNewNodeModal = () => {
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
        
        if (numberOfEdges > (numberOfNodes * (numberOfNodes - 1) / 2)) {
            console.log("Too many edges");
            return;
        }

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
                                <Button variant="primary" block onClick={this.toggleAddNewNodeModal}>Add new node</Button>
                            </Row>
                            <Row className="text-center pt-3">
                                <Button variant="primary" block onClick={this.toggleNewRandomGraphModal}>Generate random graph</Button>
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
                            <Form.Label>Number of edges besides the edges for tree graph</Form.Label>
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
});

const mapDispatchToProps = dispatch => ({
    getGraph: () => dispatch(actions.getGraph()),
    setGraph: (graph) => dispatch(actions.setGraph(graph)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);