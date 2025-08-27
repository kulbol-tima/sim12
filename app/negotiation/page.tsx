
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '../../lib/store';

interface Message {
  id: number;
  type: 'seller' | 'buyer' | 'system';
  text: string;
  emotion?: 'neutral' | 'worried' | 'hopeful' | 'surprised' | 'pleased' | 'confused' | 'relieved';
  timestamp: Date;
}

interface QuestionOption {
  id: string;
  text: string;
  category: 'info' | 'rapport' | 'motivation' | 'financial';
  response: string;
  emotion: 'neutral' | 'worried' | 'hopeful' | 'surprised' | 'pleased' | 'confused' | 'relieved';
  unlocks?: string[];
}

interface OfferComponent {
  type: 'subject-to' | 'seller-financing' | 'seller-pays-buyer' | 'asset-exchange';
  value?: number;
  rate?: number;
  assets?: string[];
  details: string;
}

function NegotiationContent() {
  const { scenario } = useStore();
  const searchParams = useSearchParams();
  searchParams.get('scenario');

  const [messages, setMessages] = useState<Message[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<string[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [sellerEmotion, setSellerEmotion] = useState<'neutral' | 'worried' | 'hopeful' | 'surprised' | 'pleased' | 'confused' | 'relieved'>('neutral');
  const [showOfferBuilder, setShowOfferBuilder] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<OfferComponent[]>([]);
  const [negotiationPhase, setNegotiationPhase] = useState<'greeting' | 'discovery' | 'offer' | 'response'>('greeting');

  useEffect(() => {
    if (scenario && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'system',
          text: `Вы встречаетесь с ${scenario.seller.name}. Он выглядит обеспокоенным, но готов к разговору. Начните с установления контакта.`,
          timestamp: new Date()
        }
      ]);
      setAvailableQuestions(['greeting']);
      setNegotiationPhase('greeting');
    }
  }, [scenario, messages.length]);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Сценарий не найден</h3>
          <p className="text-gray-500 mb-6">
            Пожалуйста, сгенерируйте сценарий, чтобы начать переговоры.
          </p>
          <Link
            href="/scenario-generator"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            К генератору сценариев
          </Link>
        </div>
      </div>
    );
  }

  const { seller, property, financials } = scenario;

  const questionOptions: { [key: string]: QuestionOption } = {
    greeting: {
      id: 'greeting',
      text: 'Здравствуйте! Я инвестор в недвижимость, увидел ваше объявление. Расскажите о ситуации?',
      category: 'rapport',
      response: 'Да, здравствуйте... Честно говоря, ситуация сложная. Мы потеряли работу несколько месяцев назад, накопились долги по ипотеке. Боимся потерять дом.',
      emotion: 'worried',
      unlocks: ['mortgage_details', 'timeline', 'family_situation']
    },
    mortgage_details: {
      id: 'mortgage_details',
      text: 'Можете рассказать подробнее о ипотеке? Сколько осталось выплачивать и какова просрочка?',
      category: 'financial',
      response: `У нас осталось $${property.owedAmount.toLocaleString()} по ипотеке, ежемесячный платеж $${property.monthlyPayment.toLocaleString()}. Мы не платили уже ${financials.arrearsMonths} месяца, набежало $${financials.arrearsAmount?.toLocaleString()} долга. Банк грозит foreclosure.`,
      emotion: 'worried',
      unlocks: ['house_value', 'foreclosure_timeline', 'other_debts']
    },
    house_value: {
      id: 'house_value',
      text: 'А какая, по вашему мнению, рыночная стоимость дома сейчас?',
      category: 'financial',
      response: `Риелтор говорил около $${property.fmv.toLocaleString()}, может чуть меньше. Мы покупали за $${(property.fmv * 1.1).toLocaleString()} три года назад, но рынок немного просел.`,
      emotion: 'neutral',
      unlocks: ['selling_costs', 'equity_situation']
    },
    timeline: {
      id: 'timeline',
      text: 'Сколько времени у вас есть? Когда намечен аукцион?',
      category: 'motivation',
      response: 'Банк сказал, что через 30-45 дней подаст документы на foreclosure. Нам очень нужно решить это быстро, иначе потеряем все.',
      emotion: 'worried',
      unlocks: ['quick_solution', 'family_impact']
    },
    selling_costs: {
      id: 'selling_costs',
      text: 'Если продавать через риелтора, сколько уйдет на комиссии и расходы?',
      category: 'financial',
      response: 'Риелтор берет 6%, плюс closing costs около 2-3%. Получается почти $30,000 расходов. Плюс нужно время, которого у нас нет.',
      emotion: 'confused',
      unlocks: ['net_proceeds', 'time_pressure']
    },
    family_situation: {
      id: 'family_situation',
      text: 'Понимаю, это стрессовая ситуация для всей семьи. Как держитесь?',
      category: 'rapport',
      response: 'Спасибо, что спрашиваете. Дети не понимают, что происходит, жена очень переживает. Мы просто хотим сохранить кредитную историю и начать заново.',
      emotion: 'worried',
      unlocks: ['credit_concerns', 'future_plans']
    },
    credit_concerns: {
      id: 'credit_concerns',
      text: 'Сохранение кредитной истории действительно важно. Foreclosure сильно повлияет на кредитный рейтинг?',
      category: 'motivation',
      response: 'Да, банкир сказал, что foreclosure останется в кредитной истории на 7 лет. Мы не сможем купить новый дом, даже машину в кредит будет сложно взять.',
      emotion: 'worried',
      unlocks: ['alternative_solution']
    },
    alternative_solution: {
      id: 'alternative_solution',
      text: 'А если бы существовал способ избежать foreclosure и сохранить кредитную историю, это было бы интересно?',
      category: 'motivation',
      response: '*оживляется* Конечно! Мы готовы рассмотреть любые варианты. Что вы имеете в виду?',
      emotion: 'hopeful',
      unlocks: ['creative_solution_intro']
    },
    creative_solution_intro: {
      id: 'creative_solution_intro',
      text: 'Я могу взять на себя ваши платежи по ипотеке и закрыть просрочку. Дом перейдет ко мне, но вы избежите foreclosure.',
      category: 'info',
      response: '*смотрит на жену, затем обратно* Это... возможно? Как это работает? И что мы получим взамен?',
      emotion: 'surprised',
      unlocks: ['offer_builder']
    }
  };

  const askQuestion = (questionId: string) => {
    const option = questionOptions[questionId];
    if (!option || askedQuestions.has(questionId)) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'buyer',
      text: option.text,
      timestamp: new Date()
    };

    const sellerMessage: Message = {
      id: messages.length + 2,
      type: 'seller',
      text: option.response,
      emotion: option.emotion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, sellerMessage]);
    setAskedQuestions(prev => new Set([...prev, questionId]));
    setSellerEmotion(option.emotion);

    if (option.unlocks) {
      setAvailableQuestions(prev => [...prev, ...option.unlocks.filter(id => !askedQuestions.has(id))]);
    }

    if (questionId === 'creative_solution_intro') {
      setTimeout(() => {
        setShowOfferBuilder(true);
        setNegotiationPhase('offer');
      }, 2000);
    }
  };

  const addOfferComponent = (component: OfferComponent) => {
    setCurrentOffer(prev => [...prev, component]);
  };

  const removeOfferComponent = (index: number) => {
    setCurrentOffer(prev => prev.filter((_, i) => i !== index));
  };

  const presentOffer = () => {
    if (currentOffer.length === 0) return;

    let offerText = 'Вот что я предлагаю:\\n\\n';

    currentOffer.forEach((component, index) => {
      switch (component.type) {
        case 'subject-to':
          offerText += `${index + 1}. Я принимаю дом "subject to existing loan" - беру на себя ваши платежи по ипотеке $${property.monthlyPayment}/месяц.\\n`;
          break;
        case 'seller-financing':
          offerText += `${index + 1}. Вы финансируете $${component.value?.toLocaleString()} под ${component.rate}% годовых (seller financing).\\n`;
          break;
        case 'seller-pays-buyer':
          offerText += `${index + 1}. Вы доплачиваете мне $${component.value?.toLocaleString()} на закрытии сделки для покрытия просрочки и расходов.\\n`;
          break;
        case 'asset-exchange':
          offerText += `${index + 1}. В качестве дополнительного обеспечения включаем ваши активы: ${component.assets?.join(', ')}.\\n`;
          break;
      }
    });

    offerText += '\\nЭто позволит вам избежать foreclosure и сохранить кредитную историю.';

    const offerMessage: Message = {
      id: messages.length + 1,
      type: 'buyer',
      text: offerText,
      timestamp: new Date()
    };

    let sellerResponse = '';
    let emotion: 'neutral' | 'worried' | 'hopeful' | 'surprised' | 'pleased' | 'confused' | 'relieved' = 'surprised';

    if (currentOffer.some(c => c.type === 'subject-to')) {
      sellerResponse = '*долго молчит, смотрит на бумаги* Так... вы берете на себя наши платежи? И мы избежим foreclosure? *проблеск надежды в глазах* Это правда возможно?';
      emotion = 'hopeful';
    }

    const sellerMessage: Message = {
      id: messages.length + 2,
      type: 'seller',
      text: sellerResponse,
      emotion: emotion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, offerMessage, sellerMessage]);
    setSellerEmotion(emotion);
    setNegotiationPhase('response');
    setShowOfferBuilder(false);
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'worried':
        return 'ri-emotion-sad-line text-red-500';
      case 'hopeful':
        return 'ri-emotion-happy-line text-green-500';
      case 'surprised':
        return 'ri-emotion-normal-line text-blue-500';
      case 'pleased':
        return 'ri-emotion-laugh-line text-green-600';
      case 'confused':
        return 'ri-question-line text-orange-500';
      case 'relieved':
        return 'ri-emotion-line text-green-500';
      default:
        return 'ri-emotion-normal-line text-gray-500';
    }
  };

  const getEmotionDescription = (emotion: string) => {
    switch (emotion) {
      case 'worried':
        return 'выглядит обеспокоенным';
      case 'hopeful':
        return 'появилась надежда в глазах';
      case 'surprised':
        return 'удивлен';
      case 'pleased':
        return 'выглядит довольным';
      case 'confused':
        return 'выглядит растерянным';
      case 'relieved':
        return 'выглядит облегченным';
      default:
        return 'нейтральное выражение лица';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-building-line text-white text-xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">US Real Estate Simulator</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/scenario-generator" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Новый сценарий
              </Link>
              <Link href="/deal-structure" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Структура сделок
              </Link>
              <Link href="/profile" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Профиль
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Переговоры с продавцом</h1>
              <p className="text-gray-600">Встреча с {seller.name} • {scenario.type}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Эмоциональное состояние:</p>
                <div className="flex items-center space-x-2">
                  <i className={getEmotionIcon(sellerEmotion)}></i>
                  <span className="text-sm font-medium">{getEmotionDescription(sellerEmotion)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Axiom Banner */}
        <div className="bg-green-600 rounded-lg p-4 mb-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center">
              <i className="ri-chat-voice-line text-xl"></i>
            </div>
            <div>
              <h3 className="font-semibold">Аксиома #2</h3>
              <p className="text-green-100 text-sm">Имей смелость озвучить креативный оффер, глядя в глаза клиента</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Seller Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Информация о продавце</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 block">Имя:</span>
                  <span className="font-medium">{seller.name}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">FMV дома:</span>
                  <span className="font-medium">${property.fmv.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Остаток по ипотеке:</span>
                  <span className="font-medium">${property.owedAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Просрочка:</span>
                  <span className="font-medium text-red-600">${financials.arrearsAmount?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Временные рамки:</span>
                  <span className="font-medium">{seller.timeframe}</span>
                </div>
              </div>

              {negotiationPhase === 'offer' && (
                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="ri-lightbulb-line text-blue-600"></i>
                    <span className="text-sm font-medium text-blue-900">Время для оффера!</span>
                  </div>
                  <p className="text-xs text-blue-700">Продавец готов рассматривать креативные решения. Составьте привлекательный оффер.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 border-b">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'buyer' ? 'bg-blue-600 text-white' : message.type === 'seller' ? 'bg-gray-100 text-gray-900' : 'bg-yellow-50 text-yellow-800 text-center w-full'}`}>
                        {message.type === 'seller' && message.emotion && (
                          <div className="flex items-center space-x-2 mb-2 text-xs text-gray-500">
                            <i className={getEmotionIcon(message.emotion)}></i>
                            <span>{getEmotionDescription(message.emotion)}</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Options */}
              {!showOfferBuilder && availableQuestions.length > 0 && (
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Выберите, что сказать:</h4>
                  <div className="space-y-2">
                    {availableQuestions.map((questionId) => {
                      const option = questionOptions[questionId];
                      if (!option || askedQuestions.has(questionId)) return null;

                      return (
                        <button
                          key={questionId}
                          onClick={() => askQuestion(questionId)}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                option.category === 'info' ? 'bg-blue-100' : option.category === 'rapport' ? 'bg-green-100' : option.category === 'motivation' ? 'bg-purple-100' : 'bg-orange-100'
                              }`}
                            >
                              <i
                                className={`text-xs ${
                                  option.category === 'info' ? 'ri-information-line text-blue-600' : option.category === 'rapport' ? 'ri-heart-line text-green-600' : option.category === 'motivation' ? 'ri-question-line text-purple-600' : 'ri-money-dollar-circle-line text-orange-600'
                                }`}
                              ></i>
                            </div>
                            <span className="text-sm text-gray-700">{option.text}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Offer Builder Panel */}
          <div className="lg:col-span-1">
            {showOfferBuilder ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Создание креативного оффера</h3>

                {/* Current Offer Components */}
                {currentOffer.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Текущий оффер:</h4>
                    <div className="space-y-2">
                      {currentOffer.map((component, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                          <div className="flex items-center justify-between">
                            <span>{component.details}</span>
                            <button onClick={() => removeOfferComponent(index)} className="text-red-500 hover:text-red-700 cursor-pointer">
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offer Component Options */}
                <div className="space-y-3">
                  <button
                    onClick={() => addOfferComponent({ type: 'subject-to', details: 'Subject to existing loan ($10 down)' })}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <i className="ri-home-line text-blue-600"></i>
                      <div>
                        <p className="text-sm font-medium">Subject to Existing Loan</p>
                        <p className="text-xs text-gray-500">Принять дом с существующей ипотекой</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const value = 20000;
                      const rate = 6;
                      addOfferComponent({ type: 'seller-financing', value, rate, details: `Seller financing $${value.toLocaleString()} @ ${rate}%` });
                    }}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <i className="ri-bank-line text-green-600"></i>
                      <div>
                        <p className="text-sm font-medium">Seller Financing</p>
                        <p className="text-xs text-gray-500">Продавец финансирует часть сделки</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => addOfferComponent({ type: 'seller-pays-buyer', value: (financials.arrearsAmount || 0) + 5000, details: `Продавец доплачивает $${((financials.arrearsAmount || 0) + 5000).toLocaleString()}` })}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <i className="ri-exchange-dollar-line text-orange-600"></i>
                      <div>
                        <p className="text-sm font-medium">Продавец платит покупателю</p>
                        <p className="text-xs text-gray-500">Для покрытия просрочки и расходов</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => addOfferComponent({ type: 'asset-exchange', assets: ['Ford F-150 ($28,000)', 'Лодка ($15,000)'], details: 'Включить дополнительные активы' })}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <i className="ri-car-line text-purple-600"></i>
                      <div>
                        <p className="text-sm font-medium">Обмен активами</p>
                        <p className="text-xs text-gray-500">Включить другие активы продавца</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Present Offer Button */}
                {currentOffer.length > 0 && (
                  <div className="space-y-3">
                    <button
                      onClick={presentOffer}
                      className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <i className="ri-eye-line"></i>
                      <span>Озвучить оффер</span>
                    </button>

                    <Link
                      href={`/deal-structure?scenario=${scenarioId}`}
                      className="w-full px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <i className="ri-file-settings-line"></i>
                      <span>Структурировать сделку</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Советы по переговорам</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Установление контакта</h4>
                    <p className="text-blue-700 text-xs">Сначала поймите ситуацию продавца и его мотивацию</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">Сбор информации</h4>
                    <p className="text-green-700 text-xs">Узнайте все финансовые детали перед созданием оффера</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-1">Креативность</h4>
                    <p className="text-purple-700 text-xs">Найдите win-win решение, которое поможет продавцу</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NegotiationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <i className="ri-chat-3-line text-white text-xl"></i>
            </div>
            <p className="text-gray-600">Загрузка переговоров...</p>
          </div>
        </div>
      }
    >
      <NegotiationContent />
    </Suspense>
  );
}
