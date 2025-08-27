
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-building-line text-white text-xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">US Real Estate Simulator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors whitespace-nowrap cursor-pointer">
                Войти
              </Link>
              <Link href="/scenario-generator" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap cursor-pointer">
                Начать
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20American%20real%20estate%20cityscape%20with%20skyscrapers%20and%20residential%20buildings%2C%20professional%20business%20environment%2C%20clean%20white%20and%20blue%20tones%2C%20sophisticated%20lighting%2C%20architectural%20photography%20style%2C%20expansive%20city%20view%20with%20glass%20buildings%20reflecting%20sunlight&width=1200&height=600&seq=hero-bg&orientation=landscape')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Симулятор сделок по недвижимости в США
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Отработайте креативное финансирование без капитала. Изучите Real Estate инвестиции в безопасной виртуальной среде с реалистичными сценариями американского рынка недвижимости.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/scenario-generator" className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg whitespace-nowrap cursor-pointer">
                Начать симуляцию
              </Link>
              <Link href="/negotiation" className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                Демо версия
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Возможности симулятора</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Комплексная система обучения работе с недвижимостью в США
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-list-3-line text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Генератор сценариев</h3>
              <p className="text-gray-600">
                Создавайте реалистичные ситуации с мотивированными продавцами для отработки навыков
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-chat-3-line text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Переговоры</h3>
              <p className="text-gray-600">
                Практикуйте диалоги, изучайте мотивацию и создавайте win-win предложения
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-calculator-line text-purple-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Финансовый анализ</h3>
              <p className="text-gray-600">
                DISREET анализ прибыли, оценка долга, симуляция закрытия сделки
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Estate Terms */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Изучите термины Real Estate</h2>
            <p className="text-lg text-gray-600">
              Освойте профессиональную терминологию американского рынка недвижимости
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Subject To</h4>
              <p className="text-gray-600 text-sm">Принятие недвижимости с существующей ипотекой</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Wrap-Around</h4>
              <p className="text-gray-600 text-sm">Новый займ, &quot;оборачивающий&quot; существующую ипотеку</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Lease Option</h4>
              <p className="text-gray-600 text-sm">Аренда с правом выкупа недвижимости</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Cash Flow</h4>
              <p className="text-gray-600 text-sm">Денежный поток от аренды недвижимости</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">DISREET анализ</h4>
              <p className="text-gray-600 text-sm">Комплексный анализ доходности сделки</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Assignment Fee</h4>
              <p className="text-gray-600 text-sm">Комиссия за переуступку контракта (Wholesale)</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Начните изучение Real Estate инвестиций прямо сейчас
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Присоединяйтесь к тысячам пользователей, которые уже освоили креативное финансирование
          </p>
          <Link href="/scenario-generator" className="inline-block px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg whitespace-nowrap cursor-pointer">
            Создать первую сделку
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="ri-building-line text-white"></i>
                </div>
                <h3 className="text-xl font-bold">US Real Estate Simulator</h3>
              </div>
              <p className="text-gray-400">
                Изучайте инвестиции в недвижимость США в безопасной виртуальной среде
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Обучение</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Креативное финансирование</li>
                <li>Анализ сделок</li>
                <li>Переговоры с продавцами</li>
                <li>Расчет ROI</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Функции</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/scenario-generator" className="hover:text-white transition-colors cursor-pointer">Генератор сценариев</Link></li>
                <li><Link href="/negotiation" className="hover:text-white transition-colors cursor-pointer">Переговоры</Link></li>
                <li><Link href="/deal-structure" className="hover:text-white transition-colors cursor-pointer">Структурирование</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors cursor-pointer">Портфель</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 US Real Estate Simulator. Образовательный проект.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
