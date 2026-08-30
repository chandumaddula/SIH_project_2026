import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

interface AboutSection {
  id: string;
  icon: string;
  title: string;
  content: string;
}

const ABOUT_SECTIONS: AboutSection[] = [
  {
    id: 'platform',
    icon: '🏛️',
    title: 'About the Platform',
    content:
      'The Legal Metrology Compliance System — Citizen Portal is a government-backed platform that helps consumers check product package compliance and submit complaints about products that may not meet mandatory requirements. It is designed to make the complaint process simpler and more transparent.',
  },
  {
    id: 'screening',
    icon: '🔍',
    title: 'About Package Screening',
    content:
      'The package screening feature reads the information printed on a product package from a photo you take. It checks for the presence of key mandatory details like the MRP, net quantity, manufacturer information, and expiry date. The screening result is preliminary — it tells you what the system could and could not detect from the image. It is not a substitute for an authorized inspection by a trained officer.',
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'About Automated Analysis',
    content:
      'The package screening feature uses automated image analysis to extract text and information from product photos. This analysis is performed by software — it is not reviewed by an officer at this stage. The results are preliminary and can be inaccurate. Images of poor quality, unusual fonts, or obscured text may lead to incomplete or incorrect detections. Always treat screening results as a guide, not a determination.',
  },
  {
    id: 'complaint',
    icon: '📋',
    title: 'The Complaint Process',
    content:
      'Submitting a complaint through this platform starts a formal process. Your complaint is received, reviewed, and assigned to an authorized officer. The officer may schedule a physical inspection of the product at the place of purchase. After inspection and verification against applicable rules, the officer makes a determination. You are notified at each stage. The final decision is made by the authorized officer, not by the automated screening system.',
  },
  {
    id: 'officer',
    icon: '👮',
    title: 'The Role of the Officer',
    content:
      'An authorized Legal Metrology officer conducts the formal inspection and verification process. Officers are trained government officials who examine products against the applicable rules and requirements. The officer may visit the store, examine product samples, and check records. The officer\'s determination is the official finding. The preliminary screening you see in this platform is not part of that determination.',
  },
  {
    id: 'citizen',
    icon: '👤',
    title: 'Your Role as a Citizen',
    content:
      'As a citizen, your role is to be an informed consumer. You can use the scan feature to check product packages, submit complaints when you notice issues, and track the status of your complaints. You are not expected to know the law — the platform and the officers guide the process. Your complaint helps identify and address product compliance issues in your community.',
  },
];

export const CitizenAbout: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  return (
    <div className="cit-about">
      <div className="cit-about__container">
        <header className="cit-about__header">
          <h1 className="cit-about__title">About</h1>
          <p className="cit-about__subtitle">
            Information about the platform, the process, and your role as a citizen.
          </p>
        </header>

        <div className="cit-about__sections">
          {ABOUT_SECTIONS.map(section => (
            <section
              key={section.id}
              className="cit-about__section"
              aria-labelledby={`about-section-${section.id}`}
            >
              <div className="cit-about__section-header">
                <span className="cit-about__section-icon" aria-hidden="true">
                  {section.icon}
                </span>
                <h2
                  id={`about-section-${section.id}`}
                  className="cit-about__section-title"
                >
                  {section.title}
                </h2>
              </div>
              <p className="cit-about__section-body">{section.content}</p>
            </section>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="cit-about__disclaimer" role="note">
          <span className="cit-about__disclaimer-icon" aria-hidden="true">⚠️</span>
          <div>
            <h3 className="cit-about__disclaimer-title">Important Disclaimer</h3>
            <p className="cit-about__disclaimer-text">
              This platform provides general information and a preliminary screening tool. Use
              of this platform does not guarantee any specific outcome. The preliminary
              screening result is not a legal finding. Only an authorized officer's
              determination following a formal inspection constitutes an official finding.
              This platform is a demonstration frontend and does not connect to a live
              government system.
            </p>
          </div>
        </div>

        {/* Platform info */}
        <div className="cit-about__platform-info">
          <p>
            <strong>Legal Metrology Compliance System — Citizen Portal</strong>
          </p>
          <p>Version 1.0 (Frontend Demo)</p>
          <p>Regional Metrology Office</p>
        </div>

        <div className="cit-about__back-row">
          <Button variant="ghost" onClick={handleGoHome}>
            ← Back to Home
          </Button>
        </div>
      </div>

      <CitizenAboutStyles />
    </div>
  );
};

const CitizenAboutStyles: React.FC = () => (
  <style>{`
    .cit-about {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-about__container {
      max-width: 720px;
      margin: 0 auto;
    }

    .cit-about__header {
      margin-bottom: var(--space-6);
    }

    .cit-about__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-about__subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0;
    }

    .cit-about__sections {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .cit-about__section {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      box-shadow: var(--shadow-sm);
    }

    .cit-about__section-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .cit-about__section-icon {
      font-size: 1.75rem;
      line-height: 1;
      flex-shrink: 0;
    }

    .cit-about__section-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
      margin: 0;
    }

    .cit-about__section-body {
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      line-height: 1.8;
      margin: 0;
    }

    .cit-about__disclaimer {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-5);
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-6);
    }

    .cit-about__disclaimer-icon {
      font-size: 1.5rem;
      line-height: 1;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .cit-about__disclaimer-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      color: #856404;
      margin: 0 0 var(--space-2) 0;
    }

    .cit-about__disclaimer-text {
      font-size: var(--font-size-sm);
      color: #856404;
      line-height: 1.7;
      margin: 0;
    }

    .cit-about__platform-info {
      text-align: center;
      padding: var(--space-4);
      background: var(--color-gray-100);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
    }

    .cit-about__platform-info p {
      font-size: var(--font-size-xs);
      color: var(--color-gray-600);
      margin: 0;
      line-height: 1.6;
    }

    .cit-about__platform-info p:first-child {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-700);
    }

    .cit-about__back-row {
      text-align: center;
    }

    @media (max-width: 768px) {
      .cit-about {
        padding: var(--space-4);
      }

      .cit-about__section-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `}</style>
);

export default CitizenAbout;
