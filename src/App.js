// @flow

/* eslint-disable jsx-ally/accessible-emoji */

import React, { useState, useEffect } from "react";
import getWeb3 from "./utils/getWeb3";
import createDrizzleUtils from "@drizzle-utils/core";
import Web3StatusModal from "./components/Web3StatusModal";
import Logo from "./assets/key.jpg";
import DepositPage from "./components/DepositPage";
import WithdrawPage from "./components/WithdrawPage";
import StatusPage from "./components/StatusPage";

import {
  Heading,
  Text,
  Flex,
  Box,
  Button,
  Blockie,
  QR,
  Flash,
  ThemeProvider,
  Pill,
  PublicAddress,
  EthAddress,
  theme,
} from "rimble-ui";

import { DappGateway } from "./types/DappGateway";
import hcashswapArtifact from "./contracts/Hurricash.json";

type TabState = {
  index: number,
};

const HurricashApp = () => {
  // Dapp gateway state
  const [dappGateway: DappGateway, setDappGateway] = useState({
    web3: null,
    drizzleUtils: null,
    ethAddress: null,
    attempted: false,
    hcashswapInstance: null,
    hcashswapEvent$: null,
  });

  // Status Modal
  const [web3StatusModal: Boolean, setweb3StatusModal] = useState(false);

  // "Tabs" (made with buttons)
  const [curTab: TabState, setCurTab] = useState({
    index: 0,
  });

  // Helper function to initialize web3, drizzleUtils, and the ETH accounts
  const initDappGateway = async (): Boolean => {
    // Already initialized
    if (
      dappGateway.web3 !== null &&
      dappGateway.drizzleUtils !== null &&
      dappGateway.ethAddress !== null
    ) {
      return true;
    }

    try {
      const web3 = await getWeb3();
      const drizzleUtils = await createDrizzleUtils({ web3 });
      const accounts = await drizzleUtils.getAccounts();

      let hcashswapInstance = null;
      let hcashswapEvent$ = null;

      try {
        hcashswapInstance = await drizzleUtils.getContractInstance({
          artifact: hcashswapArtifact,
        });
        hcashswapEvent$ = await drizzleUtils.createEvent$({
          artifact: hcashswapArtifact,
        });
      } catch (err) {
        hcashswapInstance = null;
        hcashswapEvent$ = null;
      }

      setDappGateway({
        web3,
        drizzleUtils,
        ethAddress: accounts[0],
        hcashswapInstance,
        hcashswapEvent$,
        attempted: true,
      });

      // Setup Account Stream
      drizzleUtils.currentAccount$.subscribe((a) => {
        if (a !== dappGateway.ethAddress) {
          setDappGateway(Object.assign({}, dappGateway, { ethAddress: a }));
        }
      });

      return true;
    } catch (err) {
      setDappGateway(Object.assign({}, dappGateway, { attempted: true }));

      return false;
    }
  };

  // On page load, grab web3 and drizzle utils and contract
  // definitions, as props, and inject them into the browser
  useEffect(() => {
    if (
      (dappGateway.web3 === null || dappGateway.drizzleUtils === null) &&
      !dappGateway.attempted
    ) {
      (async () => {
        await initDappGateway();
      })();
    }
  });

  // Display warning if no web3 found
  const noWeb3: boolean =
    dappGateway.web3 === null &&
    dappGateway.drizzleUtils === null &&
    dappGateway.attempted;

  const noContractInstance: boolean =
    dappGateway.hcashswapInstance === null && dappGateway.web3 !== null;

  return (
    <ThemeProvider theme={theme}>
      <div style={{ background: "", position: "relative", minHeight: "100vh" }}>
        <div>
          <Flex bg="#DED9FC" alignItems="center" mb="3">
            <Box
              alignItems="center"
              p={2}
              width={1}
              style={{ textAlign: "left" }}
            >
              <Heading.h1 fontSize="4" my="2" mx="2">
                <img
                  alt="logo"
                  src={Logo}
                  style={{ width: "16px", height: "16px", marginRight: "6px" }}
                />
                Hurricash v1.0
              </Heading.h1>
            </Box>

            <Box
              alignItems="center"
              p={2}
              width={1}
              style={{ textAlign: "right" }}
            >
              {dappGateway.ethAddress === null ? (
                <Button
                  size="medium"
                  my="1"
                  onClick={() => {
                    if (dappGateway.ethAddress === null) {
                      (async () => {
                        if (!(await initDappGateway())) {
                          setweb3StatusModal(true);
                        }
                      })();
                    }
                  }}
                >
                  Connect
                </Button>
              ) : (
                <Button.Outline
                  size="medium"
                  my="1"
                  onClick={() => setweb3StatusModal(true)}
                >
                  <Flex>
                    <Box mr="2">
                      <Blockie
                        opts={{ seed: dappGateway.ethAddress, size: 8 }}
                      />
                    </Box>
                    <Box>
                      <EthAddress
                        fontSize="2"
                        address={dappGateway.ethAddress}
                        truncate
                      />
                    </Box>
                  </Flex>
                </Button.Outline>
              )}
            </Box>
          </Flex>

          <Flex>
            <Box m={"auto"} width={[1, 1 / 2]}>
              <Box mx="3" my="3">
                <Heading.h2 textAlign="center" mt="3" my="3" fontSize="3">
                  Move fantom privately{" "}
                  <span role="img" aria-label="moon-face">
                    🥸
                  </span>
                </Heading.h2>
                <Text textAlign="center">
                  Hide your transfers from internet strangers.
                </Text>
              </Box>

              <Flex
                px={4}
                mx={2}
                borderColor={"#E8E8E8"}
                justifyContent={"center"}
              >
                {curTab.index === 0 ? (
                  <Pill mt={2} color="primary">
                    <Button.Text mainColor="#110C62">Send</Button.Text>
                  </Pill>
                ) : (
                  <Button.Text
                    mainColor="#988CF0"
                    onClick={() => setCurTab({ index: 0 })}
                  >
                    Send
                  </Button.Text>
                )}
                {curTab.index === 1 ? (
                  <Pill mt={2} color="primary">
                    <Button.Text mainColor="#110C62">Receive</Button.Text>
                  </Pill>
                ) : (
                  <Button.Text
                    mainColor="#988CF0"
                    onClick={() => setCurTab({ index: 1 })}
                  >
                    Receive
                  </Button.Text>
                )}
                {/* { curTab.index === 2
                  ? <Button.Text mainColor="#988CF0">Status</Button.Text>
                  : <Button.Text mainColor="#988CF0" onClick={() => setCurTab({ index: 2 })}>Status</Button.Text>
                } */}
              </Flex>

              {noWeb3 ? (
                <Flex px={4} py={3} justifyContent={"stretch"}>
                  <Flash variant="danger">
                    Connect your wallet to continue.
                  </Flash>
                </Flex>
              ) : dappGateway.hcashswapInstance === null &&
                dappGateway.web3 !== null ? (
                <Flex px={4} py={3} justifyContent={"stretch"}>
                  <Flash variant="danger">
                    Switch to the Correct network or go back to view supported
                    chains.
                  </Flash>
                </Flex>
              ) : null}

              <Flex px={4} py={3} justifyContent={"stretch"}>
                {curTab.index === 0 ? (
                  <DepositPage
                    dappGateway={dappGateway}
                    noWeb3={noWeb3}
                    noContractInstance={noContractInstance}
                  />
                ) : curTab.index === 1 ? (
                  <WithdrawPage
                    dappGateway={dappGateway}
                    noWeb3={noWeb3}
                    noContractInstance={noContractInstance}
                  />
                ) : curTab.index === 2 ? (
                  <StatusPage
                    dappGateway={dappGateway}
                    noWeb3={noWeb3}
                    noContractInstance={noContractInstance}
                  />
                ) : (
                  <div>Invalid Page</div>
                )}
              </Flex>
            </Box>
          </Flex>

          <Web3StatusModal
            isOpen={web3StatusModal}
            setIsOpen={setweb3StatusModal}
          >
            {dappGateway.ethAddress === null ? (
              <div>
                <Heading.h3>No Wallet account found</Heading.h3>
                <br />
                <Text>
                  Please visit this page in a Web3 enabled browser.{" "}
                  <a href="https://ethereum.org/use/#_3-what-is-a-wallet-and-which-one-should-i-use">
                    Learn more
                  </a>
                </Text>
              </div>
            ) : (
              <div>
                <Heading.h3 mb="3">Your connected Wallet</Heading.h3>
                <Text mb="3">
                  Scan this QR code to send funds to your connected account.
                </Text>
                <Box>
                  <QR value={dappGateway.ethAddress} />
                </Box>
                <Box mt="3">
                  <PublicAddress
                    my="3"
                    width="100%"
                    address={dappGateway.ethAddress}
                    label="Wallet address"
                  />
                </Box>
              </div>
            )}
          </Web3StatusModal>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "0",
            width: "100%",
            height: "3.5rem",
            borderTop: "1px solid #E8E8E8",
          }}
        >
          <Text style={{ textAlign: "center", paddingTop: "1rem" }}>
            &nbsp;<a href="https://github.com/Jinchans/Hurricash-core">Github</a>
            &nbsp;|&nbsp;
            <a href="https://app.gitbook.com/@jinchans/s/hurricash/">Docs</a>
            &nbsp;|&nbsp;
            <a href="https://t.me/hurricash">Telegram</a>
          </Text>
        </div>
      </div>
    </ThemeProvider>
  );
};

const App = () => {
  return <HurricashApp />;
};

export default App;
