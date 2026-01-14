import jsPDF from 'jspdf';
import 'jspdf-autotable';

// PDF 생성 유틸리티
export const generatePDF = (title, content, filename) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // 헤더 추가
    const addHeader = () => {
        doc.setFillColor(107, 116, 103);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('JSBlind', margin, 25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Premium Smart Blinds & Shades', margin, 32);
    };

    // 푸터 추가
    const addFooter = (pageNum) => {
        doc.setFillColor(245, 245, 247);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('214-649-9992 | Official Partner of JSBlind™ Factory Direct', pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    // 첫 페이지 헤더
    addHeader();
    yPosition = 50;

    // 제목
    doc.setTextColor(29, 29, 31);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPosition);
    yPosition += 15;

    // 구분선
    doc.setDrawColor(229, 229, 229);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    let pageNum = 1;

    // 콘텐츠 추가
    content.forEach((section, index) => {
        // 페이지 넘김 체크
        if (yPosition > pageHeight - 40) {
            addFooter(pageNum);
            doc.addPage();
            pageNum++;
            addHeader();
            yPosition = 50;
        }

        // 섹션 제목
        if (section.type === 'heading') {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(29, 29, 31);
            doc.text(section.text, margin, yPosition);
            yPosition += 10;
        }
        // 서브 제목
        else if (section.type === 'subheading') {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(107, 116, 103);
            doc.text(section.text, margin, yPosition);
            yPosition += 8;
        }
        // 본문
        else if (section.type === 'text') {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            const lines = doc.splitTextToSize(section.text, maxWidth);
            lines.forEach(line => {
                if (yPosition > pageHeight - 40) {
                    addFooter(pageNum);
                    doc.addPage();
                    pageNum++;
                    addHeader();
                    yPosition = 50;
                }
                doc.text(line, margin, yPosition);
                yPosition += 6;
            });
            yPosition += 2;
        }
        // 리스트
        else if (section.type === 'list') {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            section.items.forEach(item => {
                if (yPosition > pageHeight - 40) {
                    addFooter(pageNum);
                    doc.addPage();
                    pageNum++;
                    addHeader();
                    yPosition = 50;
                }
                doc.text('•', margin + 5, yPosition);
                const lines = doc.splitTextToSize(item, maxWidth - 10);
                lines.forEach((line, i) => {
                    doc.text(line, margin + 12, yPosition + (i * 6));
                });
                yPosition += lines.length * 6 + 2;
            });
            yPosition += 3;
        }
        // 단계
        else if (section.type === 'step') {
            if (yPosition > pageHeight - 50) {
                addFooter(pageNum);
                doc.addPage();
                pageNum++;
                addHeader();
                yPosition = 50;
            }
            // 단계 번호 원
            doc.setFillColor(107, 116, 103);
            doc.circle(margin + 5, yPosition - 2, 5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(section.number.toString(), margin + 5, yPosition + 1, { align: 'center' });
            
            // 단계 제목
            doc.setTextColor(29, 29, 31);
            doc.setFontSize(11);
            doc.text(section.title, margin + 15, yPosition);
            yPosition += 6;
            
            // 단계 설명
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            const lines = doc.splitTextToSize(section.description, maxWidth - 15);
            lines.forEach(line => {
                doc.text(line, margin + 15, yPosition);
                yPosition += 5;
            });
            yPosition += 5;
        }
        // 경고/팁 박스
        else if (section.type === 'warning' || section.type === 'tip') {
            if (yPosition > pageHeight - 60) {
                addFooter(pageNum);
                doc.addPage();
                pageNum++;
                addHeader();
                yPosition = 50;
            }
            const boxColor = section.type === 'warning' ? [255, 243, 224] : [227, 242, 253];
            const borderColor = section.type === 'warning' ? [239, 108, 0] : [21, 101, 192];
            
            doc.setFillColor(...boxColor);
            const boxHeight = 30;
            doc.roundedRect(margin, yPosition - 5, maxWidth, boxHeight, 3, 3, 'F');
            doc.setDrawColor(...borderColor);
            doc.setLineWidth(2);
            doc.line(margin, yPosition - 5, margin, yPosition - 5 + boxHeight);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...borderColor);
            doc.text(section.type === 'warning' ? '⚠️ Important' : '💡 Pro Tip', margin + 5, yPosition + 2);
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            const lines = doc.splitTextToSize(section.text, maxWidth - 10);
            lines.forEach((line, i) => {
                doc.text(line, margin + 5, yPosition + 10 + (i * 5));
            });
            yPosition += boxHeight + 5;
        }
        // 테이블
        else if (section.type === 'table') {
            if (yPosition > pageHeight - 80) {
                addFooter(pageNum);
                doc.addPage();
                pageNum++;
                addHeader();
                yPosition = 50;
            }
            doc.autoTable({
                startY: yPosition,
                head: [section.headers],
                body: section.rows,
                theme: 'grid',
                headStyles: {
                    fillColor: [107, 116, 103],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 10
                },
                bodyStyles: {
                    fontSize: 9,
                    textColor: [100, 100, 100]
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 247]
                },
                margin: { left: margin, right: margin }
            });
            yPosition = doc.lastAutoTable.finalY + 10;
        }
        // 공백
        else if (section.type === 'space') {
            yPosition += section.height || 10;
        }
    });

    // 마지막 페이지 푸터
    addFooter(pageNum);

    // PDF 저장
    doc.save(filename);
};

// How To Measure PDF
export const generateMeasurePDF = () => {
    const content = [
        { type: 'heading', text: 'Introduction' },
        { type: 'text', text: 'Accurate measurements are crucial for ensuring your blinds fit perfectly. This guide will walk you through the process of measuring your windows for both inside and outside mount installations.' },
        { type: 'space', height: 5 },
        
        { type: 'heading', text: 'Choose Your Mount Type' },
        { type: 'space', height: 3 },
        
        { type: 'subheading', text: 'Inside Mount' },
        { type: 'text', text: 'Blinds fit inside the window frame for a clean, built-in look. Recommended when you have sufficient depth (at least 2 inches).' },
        { type: 'list', items: [
            'Clean, streamlined appearance',
            'Showcases window trim',
            'Requires adequate depth'
        ]},
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Outside Mount' },
        { type: 'text', text: 'Blinds mount on the wall or window frame, covering the entire window. Best for maximum light control and privacy.' },
        { type: 'list', items: [
            'Maximum light blockage',
            'Makes windows appear larger',
            'Works with any window depth'
        ]},
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Inside Mount Measuring' },
        { type: 'space', height: 3 },
        
        { type: 'step', number: 1, title: 'Measure Width', description: 'Measure the inside width of the window frame at the top, middle, and bottom. Use the narrowest measurement. Round down to the nearest 1/8 inch.' },
        { type: 'step', number: 2, title: 'Measure Height', description: 'Measure the inside height of the window frame on the left, center, and right. Use the longest measurement. Round down to the nearest 1/8 inch.' },
        { type: 'step', number: 3, title: 'Check Depth', description: 'Measure the depth of the window frame from the front to the back. You need at least 2 inches for most blinds, 3 inches for cellular shades.' },
        { type: 'space', height: 5 },
        
        { type: 'warning', text: 'We will deduct 1/4" from your width measurement to ensure proper fit and operation. Do not make any deductions yourself.' },
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Outside Mount Measuring' },
        { type: 'space', height: 3 },
        
        { type: 'step', number: 1, title: 'Measure Width', description: 'Measure the exact width you want the blind to cover. We recommend adding 2-3 inches on each side of the window frame for maximum light control.' },
        { type: 'step', number: 2, title: 'Measure Height', description: 'Measure from where you want the top of the blind to be to where you want the bottom. Add 2-3 inches above the window frame for best coverage.' },
        { type: 'step', number: 3, title: 'Check Mounting Surface', description: 'Ensure you have a flat, solid surface for mounting. The surface should be at least 1.5 inches wide for proper bracket installation.' },
        { type: 'space', height: 5 },
        
        { type: 'tip', text: 'For outside mount, we will make the blind to your exact specifications. Make sure to account for any overlap you want for light control.' },
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Measuring Tips' },
        { type: 'list', items: [
            'Always use a steel measuring tape for accuracy',
            'Measure to the nearest 1/8 inch',
            'Take multiple measurements and use the most accurate one',
            'Check for obstructions like handles, locks, or cranks',
            'Measure each window separately - they may vary',
            'Write down all measurements immediately'
        ]}
    ];

    generatePDF('How To Measure for Blinds & Shades', content, 'JSBlind-Measuring-Guide.pdf');
};

// How To Install PDF
export const generateInstallPDF = () => {
    const content = [
        { type: 'heading', text: 'Tools You\'ll Need' },
        { type: 'list', items: [
            'Power drill or screwdriver',
            'Measuring tape',
            'Pencil',
            'Level',
            'Ladder or step stool',
            'Safety glasses'
        ]},
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Inside Mount Installation' },
        { type: 'space', height: 3 },
        
        { type: 'step', number: 1, title: 'Mark Bracket Positions', description: 'Hold the brackets inside the window frame at the top corners. Mark the screw holes with a pencil. Ensure brackets are level and at equal heights.' },
        { type: 'step', number: 2, title: 'Pre-drill Holes', description: 'Using a drill bit slightly smaller than your screws, pre-drill holes at the marked positions. This prevents wood from splitting and makes installation easier.' },
        { type: 'step', number: 3, title: 'Install Brackets', description: 'Secure the brackets to the window frame using the provided screws. Make sure they are tight and firmly attached. Double-check that they are level.' },
        { type: 'step', number: 4, title: 'Insert Headrail', description: 'Slide the headrail into the brackets. You should hear a click when it locks into place. Gently tug to ensure it\'s secure.' },
        { type: 'step', number: 5, title: 'Install Valance (Optional)', description: 'If your blinds came with a valance, snap it onto the front of the headrail. This covers the mechanism for a finished look.' },
        { type: 'step', number: 6, title: 'Test Operation', description: 'Lower and raise the blinds several times to ensure smooth operation. Adjust the tilt mechanism if applicable. Make any necessary adjustments.' },
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Outside Mount Installation' },
        { type: 'space', height: 3 },
        
        { type: 'step', number: 1, title: 'Mark Bracket Positions', description: 'Position brackets on the wall or window frame where you want the blinds mounted. Use a level to ensure they are straight. Mark screw holes with a pencil.' },
        { type: 'step', number: 2, title: 'Check for Studs', description: 'Use a stud finder to locate wall studs for the most secure installation. If mounting into drywall without studs, use appropriate wall anchors.' },
        { type: 'step', number: 3, title: 'Install Wall Anchors (if needed)', description: 'If not mounting into studs, drill holes and insert wall anchors. This provides a secure base for the screws and prevents damage to the wall.' },
        { type: 'step', number: 4, title: 'Attach Brackets', description: 'Screw the brackets into the wall or window frame. Ensure they are level and firmly secured. The brackets should not wobble or move.' },
        { type: 'step', number: 5, title: 'Mount Headrail', description: 'Clip or slide the headrail into the mounted brackets. Listen for the click that indicates it\'s locked in place. Test by gently pulling down.' },
        { type: 'step', number: 6, title: 'Final Adjustments', description: 'Test the blinds by raising and lowering them. Ensure they operate smoothly and hang evenly. Make any necessary adjustments to the brackets.' },
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Motorized Blinds Installation' },
        { type: 'text', text: 'Motorized blinds follow the same installation steps as manual blinds, with a few additional considerations:' },
        { type: 'list', items: [
            'Ensure batteries are installed before mounting (for battery-powered motors)',
            'Position the motor end according to your preference (left or right)',
            'Pair the remote control with the motor before final installation',
            'For hardwired motors, consult a licensed electrician',
            'Test the motor operation before completing installation',
            'Keep the remote control manual for programming instructions'
        ]},
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Safety Tips' },
        { type: 'warning', text: 'Always follow these safety precautions during installation:' },
        { type: 'list', items: [
            'Always wear safety glasses when drilling',
            'Use a sturdy ladder and have someone assist you',
            'Turn off power when installing hardwired motorized blinds',
            'Keep cords and chains out of reach of children and pets',
            'Check that all screws are tight before releasing the blinds',
            'If unsure about electrical work, hire a professional'
        ]}
    ];

    generatePDF('How To Install Blinds & Shades', content, 'JSBlind-Installation-Guide.pdf');
};

// How To Choose PDF
export const generateChoosePDF = () => {
    const content = [
        { type: 'heading', text: 'Compare Blind Types' },
        { type: 'space', height: 3 },
        
        { type: 'table', 
          headers: ['Type', 'Best For', 'Light Control', 'Privacy'],
          rows: [
              ['Roller Shades', 'Modern homes, offices', 'Excellent', 'High'],
              ['Zebra Shades', 'Bedrooms, living rooms', 'Adjustable', 'Medium-High'],
              ['Cellular Shades', 'Energy efficiency', 'Good', 'High'],
              ['Woven Wood', 'Living rooms, rustic decor', 'Moderate', 'Medium']
          ]
        },
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Key Considerations' },
        { type: 'space', height: 3 },
        
        { type: 'subheading', text: 'Light Control' },
        { type: 'text', text: 'Consider how much natural light you want in the room:' },
        { type: 'list', items: [
            'Blackout: Complete darkness for bedrooms',
            'Light Filtering: Soft, diffused light',
            'Sheer: Maximum natural light with privacy'
        ]},
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Privacy Level' },
        { type: 'text', text: 'Determine your privacy needs for each room:' },
        { type: 'list', items: [
            'High Privacy: Bedrooms, bathrooms',
            'Medium Privacy: Living rooms, dining rooms',
            'Low Privacy: Kitchens, home offices'
        ]},
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Moisture Resistance' },
        { type: 'text', text: 'Choose appropriate materials for humid areas:' },
        { type: 'list', items: [
            'Faux Wood: Bathrooms, kitchens',
            'Vinyl: High humidity areas',
            'Fabric: Dry areas only'
        ]},
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Room-by-Room Guide' },
        { type: 'space', height: 3 },
        
        { type: 'subheading', text: 'Living Room' },
        { type: 'text', text: 'Recommendation: Roller or Zebra Shades' },
        { type: 'list', items: [
            'Light filtering for daytime',
            'Motorization for convenience',
            'Neutral colors for flexibility'
        ]},
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Bedroom' },
        { type: 'text', text: 'Recommendation: Blackout Roller or Cellular Shades' },
        { type: 'list', items: [
            'Blackout fabric essential',
            'Top-down/bottom-up option',
            'Quiet operation for peace'
        ]},
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Home Office' },
        { type: 'text', text: 'Recommendation: Cellular or Roller Shades' },
        { type: 'list', items: [
            'Anti-glare fabrics',
            'Motorized for video calls',
            'Neutral tones reduce eye strain'
        ]},
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Bathroom' },
        { type: 'text', text: 'Recommendation: Faux Wood or Vinyl Blinds' },
        { type: 'list', items: [
            'Water-resistant fabrics',
            'Easy to clean',
            'Privacy is priority'
        ]},
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Quick Decision Helper' },
        { type: 'list', items: [
            'Need complete darkness? → Choose Blackout Roller Shades',
            'Want energy efficiency? → Choose Cellular (Honeycomb) Shades',
            'Looking for natural aesthetics? → Choose Woven Wood Shades',
            'Need flexible light control? → Choose Zebra Shades',
            'High humidity area? → Choose Faux Wood or Vinyl',
            'Want smart home integration? → Add Motorization'
        ]}
    ];

    generatePDF('How To Choose Blinds & Shades', content, 'JSBlind-Choosing-Guide.pdf');
};

// Smart Motors PDF
export const generateSmartMotorsPDF = () => {
    const content = [
        { type: 'heading', text: 'Types of Smart Motors' },
        { type: 'space', height: 3 },
        
        { type: 'table', 
          headers: ['Motor Type', 'Best For', 'Pros', 'Cons'],
          rows: [
              ['Battery Powered', 'Renters, retrofits', 'No wiring, easy install', 'Needs charging'],
              ['Hardwired (AC)', 'New construction', 'Never needs charging', 'Requires electrician'],
              ['Smart Hub', 'Smart homes', 'Voice control, automation', 'Setup complexity']
          ]
        },
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Smart Home Compatibility' },
        { type: 'space', height: 3 },
        
        { type: 'subheading', text: 'Amazon Alexa' },
        { type: 'list', items: [
            'Voice commands',
            'Routines and groups',
            'Schedules',
            'Example: "Alexa, close the bedroom blinds"'
        ]},
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Google Home' },
        { type: 'list', items: [
            'Voice control',
            'Automation',
            'Room assignment',
            'Example: "Hey Google, open all blinds to 50%"'
        ]},
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Apple HomeKit' },
        { type: 'list', items: [
            'Siri control',
            'Scenes and automation',
            'Secure and private',
            'Example: "Hey Siri, set blinds to morning scene"'
        ]},
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'SmartThings' },
        { type: 'list', items: [
            'Advanced automation',
            'Sensor integration',
            'Complex routines',
            'Example: Automatic based on temperature/light'
        ]},
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Smart Motor Features' },
        { type: 'list', items: [
            'Scheduling: Set blinds to open/close automatically at specific times',
            'Remote Control: Control from anywhere using your smartphone app',
            'Scenes & Routines: Create custom scenes like "Good Morning" or "Movie Time"',
            'Security Mode: Simulate presence when away from home',
            'Energy Savings: Optimize natural light and reduce heating/cooling costs',
            'Group Control: Control multiple blinds simultaneously'
        ]},
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Quick Setup Guide' },
        { type: 'space', height: 3 },
        
        { type: 'step', number: 1, title: 'Install the Motor', description: 'Follow the installation instructions for your specific motor type (battery or hardwired)' },
        { type: 'step', number: 2, title: 'Download the App', description: 'Install the manufacturer\'s app on your smartphone (iOS or Android)' },
        { type: 'step', number: 3, title: 'Pair the Motor', description: 'Use the app to discover and pair your motor via Bluetooth or Wi-Fi' },
        { type: 'step', number: 4, title: 'Set Limits', description: 'Program the upper and lower limits for your blinds to ensure proper operation' },
        { type: 'step', number: 5, title: 'Connect to Smart Home', description: 'Link the motor to your preferred smart home platform (Alexa, Google, etc.)' },
        { type: 'step', number: 6, title: 'Create Automations', description: 'Set up schedules, scenes, and routines for automated control' },
        { type: 'space', height: 8 },
        
        { type: 'heading', text: 'Common Questions' },
        { type: 'space', height: 3 },
        
        { type: 'subheading', text: 'How long do batteries last?' },
        { type: 'text', text: 'Typically 6-12 months depending on usage. Rechargeable batteries can last 3-6 months per charge.' },
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Can I control blinds when away from home?' },
        { type: 'text', text: 'Yes, with Wi-Fi enabled motors or a smart home hub, you can control blinds from anywhere via the app.' },
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Do I need a hub?' },
        { type: 'text', text: 'Some motors work standalone via Bluetooth. For remote access and smart home integration, a hub is usually required.' },
        { type: 'space', height: 5 },
        
        { type: 'subheading', text: 'Can I retrofit existing blinds?' },
        { type: 'text', text: 'In many cases, yes. Check compatibility with your blind type and consult with our support team.' }
    ];

    generatePDF('How To Choose Smart Motors', content, 'JSBlind-Smart-Motors-Guide.pdf');
};

// 모든 가이드를 하나의 PDF로 생성
export const generateCompletePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // 커버 페이지
    doc.setFillColor(107, 116, 103);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('JSBlind', pageWidth / 2, 80, { align: 'center' });
    
    doc.setFontSize(24);
    doc.text('Complete Installation', pageWidth / 2, 100, { align: 'center' });
    doc.text('& User Guide', pageWidth / 2, 115, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Smart Blinds & Shades', pageWidth / 2, 140, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Everything you need to know about', pageWidth / 2, 180, { align: 'center' });
    doc.text('measuring, installing, and choosing', pageWidth / 2, 190, { align: 'center' });
    doc.text('the perfect window treatments', pageWidth / 2, 200, { align: 'center' });
    
    doc.text('214-649-9992', pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    // 목차 페이지
    doc.addPage();
    doc.setFillColor(107, 116, 103);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Table of Contents', pageWidth / 2, 25, { align: 'center' });
    
    let yPos = 60;
    doc.setTextColor(29, 29, 31);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    
    const chapters = [
        '1. How To Measure for Blinds & Shades',
        '2. How To Install Blinds & Shades',
        '3. How To Choose Blinds & Shades',
        '4. How To Choose Smart Motors'
    ];
    
    chapters.forEach(chapter => {
        doc.text(chapter, 30, yPos);
        yPos += 15;
    });
    
    doc.save('JSBlind-Complete-Guide.pdf');
};

export default {
    generateMeasurePDF,
    generateInstallPDF,
    generateChoosePDF,
    generateSmartMotorsPDF,
    generateCompletePDF
};
