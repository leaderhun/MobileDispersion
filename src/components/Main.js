import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container,
    Row,
    Col,
    Button,
    Modal,
    Form,
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

class Main extends Component {
    state = {
        options: {
            layout: {
                hierarchical: false
            },
            edges: {
                color: "#000000"
            },
            autoResize: true,
            height: '800px',
            width: '100%'
        },
        events: {
            doubleClick: function(event) {
                let { nodes } = event;
                console.log('Double click event:', nodes[0]);
            }
        },
        network: null,
        modals: {
            addNewNodeModal: addNewNodeModalDefault,
        },
    } 
    
    componentDidMount() {      
        const graph = {
            nodes: [
                    {id: 1, label: 'A', title: 'Information will come here'},
                    {id: 2, label: 'B', title: 'Information will come here'},
                    {id: 3, label: 'C', title: 'Information will come here'},
                    {id: 4, label: 'D', title: 'Information will come here'},
                    {id: 5, label: 'E', title: 'Information will come here'}
                ],
            edges: [
                    {from: 1, to: 2},
                    {from: 1, to: 3},
                    {from: 2, to: 4},
                    {from: 2, to: 5}
                ]
        };

        this.props.setGraph(graph);
    }

    componentWillReceiveProps(props) {
        if (this.state.network) {
            // this.state.network.setData(props.graph);
        }
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
        newGraphNodes.push({id: graph.nodes.length + 1, label: values.label, title: 'Information will come here'});

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
                            <h2 className="text-center pt-3">Configuration</h2>
                            <div className="d-flex justify-content-center">
                                <Button variant="primary" block onClick={this.toggleAddNewNodeModal}>Add new node</Button>
                            </div>
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