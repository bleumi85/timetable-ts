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
