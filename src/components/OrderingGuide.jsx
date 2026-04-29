import React, { useState } from 'react';
import { X, Info, CheckCircle2, Ruler, Lightbulb, Settings, Layers, Menu } from 'lucide-react';
import categoriesImage from '../assets/blinds_categories_guide.png';
import optionsImage from '../assets/blinds_options_guide.png';
import catalogShading from '../assets/catalog_shading.png';
import catalogValance from '../assets/catalog_valance.png';
import catalogControl from '../assets/catalog_control.png';
import catalogHoneycomb from '../assets/catalog_honeycomb.png';

const OrderingGuide = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('categories');

    if (!isOpen) return null;

    const sections = [
        { id: 'categories', label: '제품 카테고리', icon: Layers },
        { id: 'options', label: '주문 옵션 가이드', icon: Settings },
        { id: 'technical', label: '카탈로그 상세 스펙', icon: Ruler },
        { id: 'tips', label: '특수 옵션 참고', icon: Lightbulb },
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(5px)',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                width: '100%',
                maxWidth: '960px',
                maxHeight: '95vh',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(to right, #f8f9fa, #ffffff)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--primary-green)', padding: '8px', borderRadius: '8px', color: 'white' }}>
                            <Info size={24} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1a1a1a' }}>ZSHINE™ 주문 가이드 (Ordering Guide)</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>2025 카탈로그 기반 오더 시 필수 참고 사항</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{ background: '#f1f1f1', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.target.style.background = '#e5e5e5'}
                        onMouseLeave={(e) => e.target.style.background = '#f1f1f1'}
                    >
                        <X size={20} color="#333" />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: '#f8f9fa', padding: '0 12px', borderBottom: '1px solid #eee', overflowX: 'auto' }}>
                    {sections.map(section => {
                        const Icon = section.icon;
                        const active = activeTab === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                style={{
                                    padding: '16px 20px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: active ? '3px solid var(--primary-green)' : '3px solid transparent',
                                    color: active ? 'var(--primary-green)' : '#666',
                                    fontWeight: active ? '700' : '500',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Icon size={18} />
                                {section.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
                    {activeTab === 'categories' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <img 
                                src={categoriesImage} 
                                alt="Categories Guide" 
                                style={{ width: '100%', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                            />
                            
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Layers size={20} color="var(--primary-green)" />
                                1. 제품별 카테고리 구성
                            </h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                {[
                                    { title: '롤러 블라인드 (Roller)', desc: '심플한 디자인, 다양한 차광 단계', use: '거실, 침실, 사무실' },
                                    { title: '제브라 블라인드 (Zebra)', desc: '이중 구조를 통한 간편한 빛 조절', use: '모던 인테리어, 프라이버시 보호' },
                                    { title: '샹그릴라 (Shangri-la)', desc: '커튼의 우아함과 블라인드의 기능성 결합', use: '고급형 거실, 호텔 느낌 연출' },
                                    { title: '허니콤 (Honeycomb)', desc: '벌집 구조의 단열 및 방음 효과', use: '온도 유지가 중요한 침실, 발코니' },
                                    { title: '우드/알루미늄 (Wood/Alu)', desc: '내구성이 강하고 클래식한 분위기', use: '주방, 욕실, 서재' }
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '16px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #edf2f7' }}>
                                        <div style={{ fontWeight: '700', color: '#2d3748', marginBottom: '6px' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '8px' }}>{item.desc}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--primary-green)', fontWeight: '600' }}>추천: {item.use}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'options' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <img 
                                src={optionsImage} 
                                alt="Options Guide" 
                                style={{ width: '100%', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                            />
                            
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Settings size={20} color="var(--primary-green)" />
                                2. 주문 시 필수 선택 옵션 (Order Specs)
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <OptionGroup title="① 차광 수준 (Fabric Shading Effect)" items={[
                                    { label: 'Transparent (투명)', desc: '외부 전경이 보이며 빛이 많이 투과됨' },
                                    { label: 'Semi-blackout (반암막)', desc: '형태만 보일 정도의 부드러운 채광' },
                                    { label: 'Full blackout (완전암막)', desc: '숙면이나 영상 시청 및 빛 완전 차단' }
                                ]} />

                                <OptionGroup title="② 구동 방식 (Control Systems)" items={[
                                    { label: 'Bead Chain (비드 체인)', desc: '표준 수동 방식' },
                                    { label: 'Cordless (무선)', desc: '어린이/반려동물 안전, 손잡이 조절' },
                                    { label: 'Motorized (전동)', desc: 'APP 연동, 리모컨 제어, 충전식 또는 전원식' },
                                    { label: 'TDBU', desc: '허니콤 전용, 상하 양방향 개폐 시스템' }
                                ]} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'technical' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Ruler size={20} color="var(--primary-green)" />
                                카탈로그 상세 기술 스펙 (Technical Specs)
                            </h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#666' }}>[Page 2] 차광 효과 상세 (Shading Effect)</h4>
                                    <img src={catalogShading} alt="Catalog Shading" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#666' }}>[Page 3] 밸런스/박스 디자인 (Valance)</h4>
                                    <img src={catalogValance} alt="Catalog Valance" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#666' }}>[Page 5] 구동 및 가이드 시스템</h4>
                                    <img src={catalogControl} alt="Catalog Control" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#666' }}>[Page 33] 허니콤 셀 규격 (Cell Size)</h4>
                                    <img src={catalogHoneycomb} alt="Catalog Honeycomb" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                            </div>
                        </div>
                    )}

                                <OptionGroup title="③ 상단 밸런스 및 레일 디자인 (Valance & Rail)" items={[
                                    { label: 'Valance (상단 박스)', desc: 'Square, Curve, Fabric Wrapped, Fabric Inserted' },
                                    { label: 'Bottom Rail (하단 바)', desc: 'Type A(물방울형), Type B, Type C 등' },
                                    { label: 'Side Track (사이드 가이드)', desc: '빛 샘 방지를 위한 L자형 또는 U자형 가이드' }
                                ]} />

                                <OptionGroup title="④ 설치 규격 (Size & Mounting)" items={[
                                    { label: 'Width & Height', desc: 'mm 단위 정확한 실측값 필요' },
                                    { label: 'Roll Direction', desc: 'Forward Roll(앞으로), Reverse Roll(뒤로)' },
                                    { label: 'Installation', desc: '천장 부착 또는 벽면 부착 확인' }
                                ]} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'tips' && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>3. 제품별 특수 옵션 참고</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <TipItem title="허니콤" text="셀(Cell) 크기를 결정해야 합니다 (26mm / 38mm / 45mm)." />
                                <TipItem title="제브라/샹그릴라" text="원단 사이의 투명 망사(Mesh) 간격과 질감을 카탈로그 코드(예: S1, Z1 등)로 지정하십시오." />
                                <TipItem title="슬로핑 실(Sloping Cill)" text="창문 아래쪽이 경사진 경우 사선 컷팅 옵션을 적용할 수 있으나, 이 경우 끝까지 말려 올라가지 않을 수 있습니다." />
                            </div>

                            <div style={{ 
                                marginTop: '40px', 
                                padding: '20px', 
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                                borderRadius: '12px',
                                border: '1px solid #bbf7d0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '15px'
                            }}>
                                <CheckCircle2 color="#16a34a" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontWeight: '700', color: '#166534', marginBottom: '4px' }}>정확한 주문을 위한 팁</div>
                                    <div style={{ fontSize: '0.9rem', color: '#166534', lineHeight: '1.6' }}>
                                        모든 규격은 mm 단위로 기입해 주세요. 설치 환경(내창/외창)에 따라 약 5-10mm의 여유를 두는 것이 좋습니다. 궁금한 점은 우측 하단의 AI 채팅을 이용해 주세요.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '20px 24px', borderTop: '1px solid #eee', textAlign: 'center' }}>
                    <button 
                        onClick={onClose}
                        style={{
                            padding: '12px 40px',
                            background: 'var(--primary-green)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            boxShadow: '0 4px 12px rgba(10, 150, 68, 0.2)'
                        }}
                    >
                        가이드 닫기
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const OptionGroup = ({ title, items }) => (
    <div>
        <div style={{ fontWeight: '700', color: '#2d3748', marginBottom: '12px', fontSize: '1rem' }}>{title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-green)', marginTop: '8px' }}></div>
                    <div>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#4a5568' }}>{item.label}:</span>
                        <span style={{ fontSize: '0.9rem', color: '#718096', marginLeft: '6px' }}>{item.desc}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TipItem = ({ title, text }) => (
    <div style={{ display: 'flex', gap: '12px', padding: '16px', borderRadius: '8px', background: '#fff', border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: '700', color: '#2d3748', minWidth: '120px' }}>• {title}:</div>
        <div style={{ fontSize: '0.95rem', color: '#4a5568' }}>{text}</div>
    </div>
);

export default OrderingGuide;
