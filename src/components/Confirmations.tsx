import { Alert, AlertDescription, AlertIcon, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import React from 'react';

type DeleteConfirmationType = {
    id: string,
    showModal: boolean
    confirmModal: (id: string) => Promise<void>
    hideModal: () => void
    message: string
}

export const DeleteConfirmation: React.FC<DeleteConfirmationType> = (props): JSX.Element => {
    const { id, showModal, confirmModal, hideModal, message } = props;

    return (
        <Modal isOpen={showModal} onClose={hideModal}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Löschen bestätigen</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Alert status='error'>
                        <AlertIcon />
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='gray' mr={3} onClick={hideModal}>
                        Abbrechen
                    </Button>
                    <Button colorScheme='red' onClick={() => confirmModal(id)}>Löschen</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

type SimpleConfirmationType = {
    isOpen: boolean;
    onConfirm: () => void;
    onClose: () => void;
    header: string;
    message: string;
}

export const SimpleConfirmation: React.FC<SimpleConfirmationType> = (props): JSX.Element => {
    const { isOpen, onConfirm, onClose, header, message } = props;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{header}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Alert status='info'>
                        <AlertIcon />
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='gray' mr={3} variant='outline' onClick={onClose}>
                        Abbrechen
                    </Button>
                    <Button colorScheme='blue' onClick={() => onConfirm()}>Ok</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
