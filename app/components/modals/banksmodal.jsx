import React, { useContext } from "react";
import {
  Modal,
  Button,
  VStack,
  Text,
  Spinner,
  FlatList,
  Pressable,
  HStack,
} from "native-base";
import { authcontext } from "../../contexts/authcontext";

export default function Banksmodal({
  disbursementbankselect,
  setdisbursebank,
  isOpen,
  onClose,
  data,
  getbanks,
  gettingbanks,
  bankserror,
  setbank
}) {
  const { user } = useContext(authcontext);

  return (
    <Modal isOpen={isOpen} onClose={onClose} justifyContent="center" alignItems="center">
      <Modal.Content
        width="90%"
        maxHeight="85%"
        borderRadius="20px"
        bg="white"
        shadow={4}
      >
        <Modal.CloseButton />
        <Modal.Header bg="blue.600" borderTopRadius="20px">
          <Text color="white" fontSize="lg" fontWeight="bold">
            Select Bank
          </Text>
        </Modal.Header>

        <Modal.Body bg="gray.50" p="15px">
          <VStack space={4} width="100%">

            {/* Loading Section */}
            {gettingbanks && (
              <VStack space={2} alignItems="center" py="20px">
                <Spinner color="blue.600" size="lg" />
                <Text color="blue.600">Fetching bank list...</Text>
              </VStack>
            )}

            {/* Error Section */}
            {bankserror && (
              <VStack space={3} alignItems="center" py="10px">
                <Text color="red.500" fontWeight="bold">
                  {bankserror}
                </Text>

                <Button
                  onPress={() => getbanks()}
                  colorScheme="blue"
                  width="120px"
                >
                  Retry
                  {gettingbanks && <Spinner ml="5px" color="white" size="sm" />}
                </Button>
              </VStack>
            )}

            {/* No banks found */}
            {data?.length === 0 && !gettingbanks && (
              <Text textAlign="center" color="gray.500">
                No banks found
              </Text>
            )}

            {/* Banks List */}
            {data && data.length > 0 && !gettingbanks && (
              <FlatList
                data={data}
                width="100%"
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item, index }) => (
                  <Pressable
                    onPress={() => {
                      if (disbursementbankselect) setdisbursebank(item);
                      else setbank(item);
                      onClose();
                    }}
                  >
                    {({ isPressed }) => (
                      <HStack
                        bg={isPressed ? "blue.100" : "white"}
                        px="15px"
                        py="12px"
                        borderRadius="10px"
                        mb="8px"
                        borderWidth="1px"
                        borderColor="gray.200"
                        alignItems="center"
                      >
                        <Text fontSize="md" color="black">
                          {index + 1}. {item.bank_name}
                        </Text>
                      </HStack>
                    )}
                  </Pressable>
                )}
              />
            )}
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
