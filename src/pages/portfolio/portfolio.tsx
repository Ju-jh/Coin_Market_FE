/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { faBars, faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { BookModal } from "../../components/modal/ManualModal";
import { useDarkMode } from "../../context/Dark-mode";
import Key from "../../components/key/key";
import IsKey from "../../components/key/iskey";
import axios from "axios";
import { BithumbResponse, TradingChartApi } from "../../api/TradingChart-api";

export const PortFolioTracker = () => {
  const { darkMode } = useDarkMode();
  const [isMenu, setIsMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isName, setIsName] = useState("");
  const [isKeyInDB, setIsKeyInDB] = useState<boolean>(false);
  const [lists, setLists] = useState<any[]>([]);
  const [responseData, setResponseData] = useState<BithumbResponse | null>(
    null
  );
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const [alreadyInDBCoins, setAlreadyInDBCoins] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [isDataSuccess, setisDataSuccess]=useState(false)
  

  const handleRefresh = () => {
    setRefresh(true); 
    fetchDataSequentially();
  };

  const onDataLoaded = (data: BithumbResponse) => {
    setResponseData(data);
  };

  const filterCoins = (data: BithumbResponse | null) => {
    if (!data) return [];

    return Object.keys(data.data);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onWallet = () => {
    openModal();
    setIsName("page1");
  };

  const onIsMenu = () => {
    setIsMenu(!isMenu);
  };

  const handleCoinSelection = (currency: string) => {
    if (selectedCoins.includes(currency)) {
      setSelectedCoins(selectedCoins.filter((coin) => coin !== currency));
    } else {
      setSelectedCoins([...selectedCoins, currency]);
    }
  };

  const isKeyInDBFunction = () => {
    axios
      .get("https://port-0-coin-market-be-12fhqa2llob5p0if.sel5.cloudtype.app/user/apikey", {
        withCredentials: true,
      })
      .then((response) => {
        const connectkey = response.data.connectKey;
        const secretkey = response.data.secretKey;
        connectkey.length !== 0 && secretkey.length !== 0
          ? setIsKeyInDB(true)
          : setIsKeyInDB(false);
        // console.log("API 키가 성공적으로 전송되었습니다.");
      })
      // .catch((error) => {
      //   console.error("API 키 전송 중 오류 발생 isKeyInDBFunction", error);
      // });
  };

  const fetchDataSequentially = async () => {
  setisDataSuccess(false);

  try {
    const response = await axios.get("https://port-0-coin-market-be-12fhqa2llob5p0if.sel5.cloudtype.app/portfolio/mylist", {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    const requests = response.data.map(async (coin: string) => {
      let attempts = 30;
      while (attempts > 0) {
        try {
          const response = await axios.get(`https://port-0-coin-market-be-12fhqa2llob5p0if.sel5.cloudtype.app/portfolio/list/${coin}`, {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          
          return response.data;
        } catch (error) {
          // console.error(`요청 실패: ${coin}. 재시도 중...`);
          attempts--;
        }
      }

      if (attempts === 0) {
        // console.error(`요청 실패: ${coin}. 최대 재시도 횟수 초과.`);
        return {};
      }
    });

    const results = await Promise.all(requests);
    const successfulResults = results.filter(result => Object.keys(result).length > 0);
    
    setAlreadyInDBCoins(response.data);
    setLists(successfulResults);
    setisDataSuccess(true)
  } catch (error) {
    setisDataSuccess(false);
    console.error('전체 불러오기를 실패하였을 수도 있습니다.', error);
  }
};

  const deleteSelectedCoinsToServer = (coinName: string) => { 
    axios.post("https://port-0-coin-market-be-12fhqa2llob5p0if.sel5.cloudtype.app/portfolio/delete", { coinName }, {
      headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
    })
      .then(() => {
      setRefresh(true);
    })
      .catch((error) => {
        console.error(error);
    });
  }


  const sendSelectedCoinsToServer = () => {
    const data = {
      selectedCoins: selectedCoins,
    };

    axios
      .post("https://port-0-coin-market-be-12fhqa2llob5p0if.sel5.cloudtype.app/portfolio/create", data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    isKeyInDBFunction();
    fetchDataSequentially();
    setisDataSuccess(false)
    if (refresh) {
      setisDataSuccess(false)
      fetchDataSequentially();
      setRefresh(false)
    }
  }, [refresh]);

  const filteredCoins = filterCoins(responseData);

  return (
    <main className={`mt-[60px] md:mt-[70px] overflow-x-hidden h-[1100px]`}>
      <div className="w-full h-full ">
        <div className="md:w-[99%] p-[20px] w-full h-full  mx-auto">
          <div className="md:pl-0 pl-2 md:mt-0 mt-4 h-[100%]">
            <div className="relative md:h-[100%] text-center flex flex-col  justify-between py-[20px]">
              {isKeyInDB && <IsKey setIsKeyInDB={setIsKeyInDB} />}
              <div className="HowToUsePortfolio absolute hidden md:flex items-start w-[300px] py-[10px] px-[20px]">
                <div
                  className={`w-[30px] h-[30px] rounded-lg border-2 ${
                    darkMode ? "border-white" : "border-black"
                  }`}
                >
                  <button
                    className={`w-full h-full shadow-md ${
                      darkMode ? "shadow-white" : "shadow-black"
                    }`}
                    onClick={onIsMenu}
                  >
                    <FontAwesomeIcon icon={faBars} />
                  </button>
                </div>
                <div className="flex-1 w-full text-center">
                  <p className="pl-2 font-bold text-[20px] text-start">사용방법</p>
                  <ul
                    className="text-left"
                    style={{ display: isMenu ? "block" : "none" }}
                  >
                    <li className="text-gray-300 list-disc">
                      <button
                        className={`${
                          darkMode ? "text-white" : "text-black"
                        } hover:underline decoration-1 hover:text-blue-500 text-[14px]`}
                        onClick={onWallet}
                      >
                        api key 발급방법
                      </button>
                      <BookModal
                        isNames={isName}
                        isOpen={isModalOpen}
                        onClose={closeModal}
                      />
                    </li>
                  </ul>
                </div>
              </div>
              <div className="KeyInput flex-1 flex flex-col justify-center h-[90%]">
                {!isKeyInDB ? (
                  <Key setIsKeyInDB={setIsKeyInDB} />
                ) : (
                  <div className="flex justify-between px-[20px] h-[900px]">
                    <div className="w-[300px] hidden md:flex flex-col items-center justify-between mr-[20px] h-full">
                      <TradingChartApi onDataLoaded={onDataLoaded} />
                      <div className={`IndexOFCoin w-full h-[800px] ${darkMode ? "bg-black":"bg-white"}  shadow-sm shadow-black overflow-y-auto`}>
                        <table className="w-full">
                          <thead
                            className="min-h-[400px] shadow-md shadow-black bg-slate-400 md:border-gray-200 md:text-center sticky top-0"
                            style={{ zIndex: 1 }}
                          >
                            <tr
                              className={`${darkMode}shadow-md md:shadow-md w-[100%] h-[50px]`}
                            >
                              <th className="md:flex-1 md:py-2 md:table-cell w-[5%] text-[10px] sm:text-[12px] md:text-[15px] lg:text-[17px] ">
                                선택
                              </th>
                              <th className="md:flex-1 md:py-2 w-[10%] text-[10px] sm:text-[12px] md:text-[15px] lg:text-[17px]">
                                가상코인
                              </th>
                            </tr>
                          </thead>
                          <tbody
                            className={`text-center md:text-center ${darkMode}`}
                          >
                            {filteredCoins.map((currency: any) => {
                              const item = responseData?.data[currency];
                              if (!item) return null;
                              if (currency === "date") return;

                              const isSelected =
                                selectedCoins.includes(currency);
                              
                              const isAlreadyInDB = 
                                alreadyInDBCoins.includes(currency)
                              
                              return (
                                <tr
                                  key={currency}
                                  className={`cursor-pointer relative shadow-md border-1 border-solid hover:border-slate-400 ${
                                    darkMode
                                      ? "hover:bg-yellow-600"
                                      : "hover:bg-[#ffe45c]"
                                    }  hover:shadow-slate-400 transition-hover
                                    ${
                                      isAlreadyInDB ? "bg-yellow-500 hover:bg-yellow-500 shadow-slate-400" : ""
                                    }
                                    `}
                                  style={{
                                    position: "relative",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    handleCoinSelection(currency);
                                  }}
                                >
                                  <td className="md:[flex-1] md:table-cell md:border-r md:border-gray-200">
                                    <button
                                      id="favorite"
                                      className={`w-full h-full hover:scale-150 ${isAlreadyInDB ? "hover:scale-100":""}`}
                                    >
                                      <FontAwesomeIcon
                                        icon={faSquareCheck}
                                        style={{
                                          color: isSelected || isAlreadyInDB
                                            ? `${darkMode ? "white":"#01060e"}`
                                            : `${darkMode ? "gray":"bababa"}`,
                                        }}
                                        className={`w-[100%] ${ isSelected ? "text-yellow-400" : "" }`}
                                      />
                                    </button>
                                  </td>
                                  <td className="flex-1 py-2 border-r border-gray-200 md:flex-1 md:py-2 md:border-r md:border-gray-200 text-[4px] sm:text-[12px] md:text-[15px] lg:text-[17px]">
                                    {currency}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div
                        className={`CreateBtn-[5px] flex-1 md:p-[5px] w-full flex flex-col items-center justify-center `}
                      >
                        <button
                          className={`h-[60px] rounded-lg hover:bg-blue-700 w-full shadow ${
                            darkMode
                              ? "shadow-white bg-blue-500"
                              : "shadow-black bg-blue-500"
                          }`}
                          onClick={() => {
                            sendSelectedCoinsToServer();
                            handleRefresh();
                          }}
                        >
                          <p className="text-black text-[17px] px-3">
                            +Create portfolio
                          </p>
                        </button>
                      </div>
                    </div>
                    <ul className={`flex-1 px-[20px] h-full overflow-y-auto rounded-sm ${darkMode ? "bg-black shadow-white":"bg-white shadow-black"} shadow-md`}>
                        {isDataSuccess &&
                          lists.map((item, index) => (
                            <li
                              key={index}
                              className={`mb-[20px] h-[60px] first:mt-[20px] rounded-xl ${darkMode ? "shadow-white":"shadow-black"} shadow-md flex items-center jus`}
                            >
                              <div className='w-[90%] text-start ml-3'>
                                <span>코인 : {item.data.order_currency}</span>
                                <span>화폐 : {item.data.payment_currency}</span>
                                <span>수수료 : {item.data.trade_fee}</span>
                                <span>보유수량 : {item.data.balance}</span>
                              </div>
                              <button
                                className='w-[10%] bg-blue-500 hover:bg-blue-300 rounded mr-3 '
                                onClick={() => { deleteSelectedCoinsToServer(item.data.order_currency) }}
                              >
                                삭제
                              </button>
                            </li>
                          ))
                        }
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
