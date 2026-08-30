import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

interface HelpLink {
  label: string;
  description: string;
}

interface HelpCategory {
  id: string;
  icon: string;
  title: string;
  description: string;
  items: HelpLink[];
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'faq',
    icon: '❓',
    title: 'Common Questions',
    description: 'Quick answers to questions citizens ask most often.',
    items: [
      {
        label: 'How do I scan a product?',
        description:
          'Go to "Scan" from the home page or sidebar. Take a clear photo of the product package and the system will read the information automatically.',
      },
      {
        label: 'What does the screening result mean?',
        description:
          'A green result means no immediate concerns. A yellow result means a review is recommended. A red result means potential issues that may warrant a complaint.',
      },
      {
        label: 'How long does a complaint take?',
        description:
          'Timelines vary based on the complexity of the case. You can track the current stage of your complaint at any time using the complaint ID.',
      },
      {
        label: 'Can I edit a complaint after submitting?',
        description:
          'Once a complaint is submitted, you cannot edit the core details. However, you can submit additional information if the officer requests it.',
      },
    ],
  },
  {
    id: 'consumer',
    icon: '🛡️',
    title: 'Consumer Help & Awareness',
    description: 'General resources to help you as a consumer.',
    items: [
      {
        label: 'Know your rights as a consumer',
        description:
          'You have the right to clear and accurate information on the products you buy, the right to receive the quantity you paid for, and the right to file a complaint if a product does not meet mandatory requirements.',
      },
      {
        label: 'Read before you buy',
        description:
          'Always check the package before purchasing. Look for the product name, manufacturer or packer details, net quantity, MRP, and any required date information.',
      },
      {
        label: 'Keep your bill or receipt',
        description:
          'A bill or receipt is strong evidence of where and when you bought the product. It helps if you need to file a complaint later.',
      },
    ],
  },
  {
    id: 'metrology',
    icon: '⚖️',
    title: 'About Legal Metrology',
    description: 'General information about the Legal Metrology framework.',
    items: [
      {
        label: 'What is Legal Metrology?',
        description:
          'Legal Metrology is the framework of rules that govern measurements used in trade and commerce, including the mandatory information that must appear on pre-packaged consumer goods.',
      },
      {
        label: 'What is the role of an inspector?',
        description:
          'An authorized inspector examines products and packages to verify they meet mandatory requirements. Inspections may follow from a consumer complaint or may be scheduled as part of routine review.',
      },
      {
        label: 'What is the role of this platform?',
        description:
          'This platform helps consumers submit complaints, track their status, and access information about the inspection process. It does not replace the formal inspection and enforcement process.',
      },
    ],
  },
  {
    id: 'contact',
    icon: '📞',
    title: 'Where to Get Help',
    description:
      'For official matters, contact the relevant government office through the channels listed on the official portal. Specific phone numbers and addresses are not provided here as they vary by region and may change.',
    items: [
      {
        label: 'Official Legal Metrology portal',
        description:
          'Visit the official Legal Metrology department portal for your region to find up-to-date contact information, office addresses, and consumer helpline numbers.',
      },
      {
        label: 'Local Consumer Helpline',
        description:
          'For broader consumer issues, your local consumer helpline can assist with general consumer rights. They are separate from Legal Metrology matters.',
      },
      {
        label: 'Regional Metrology Office',
        description:
          'For product-related concerns within a specific region, contact the Regional Metrology Office serving that area. Use the official directory to find the correct office.',
      },
    ],
  },
];

export const CitizenHelp: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  return (
    <div className="cit-help">
      <div className="cit-help__container">
        <header className="cit-help__header">
          <h1 className="cit-help__title">Help & Resources</h1>
          <p className="cit-help__subtitle">
            Information and guidance to help you use the platform and understand the process.
          </p>
        </header>

        <div className="cit-help__quick-grid">
          {HELP_CATEGORIES.map(category => (
            <section
              key={category.id}
              className="cit-help__category"
              aria-labelledby={`cit-help-title-${category.id}`}
            >
              <div className="cit-help__category-header">
                <span className="cit-help__category-icon" aria-hidden="true">
                  {category.icon}
                </span>
                <div>
                  <h2
                    id={`cit-help-title-${category.id}`}
                    className="cit-help__category-title"
                  >
                    {category.title}
                  </h2>
                  <p className="cit-help__category-description">{category.description}</p>
                </div>
              </div>

              <ul className="cit-help__items">
                {category.items.map((item, i) => (
                  <li key={i} className="cit-help__item">
                    <h3 className="cit-help__item-label">{item.label}</h3>
                    <p className="cit-help__item-text">{item.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="cit-help__disclaimer">
          <span>ℹ️</span>
          <p>
            The information on this page is general guidance only. It does not constitute
            legal advice. For specific matters, consult an authorized legal professional or
            the relevant government office.
          </p>
        </div>

        <div className="cit-help__back-row">
          <Button variant="ghost" onClick={handleGoHome}>
            ← Back to Home
          </Button>
        </div>
      </div>

      <CitizenHelpStyles />
    </div>
  );
};

const CitizenHelpStyles: React.FC = () => (
  <style>{`
    .cit-help {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-help__container {
      max-width: 960px;
      margin: 0 auto;
    }

    .cit-help__header {
      margin-bottom: var(--space-6);
    }

    .cit-help__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-help__subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0;
    }

    .cit-help__quick-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .cit-help__category {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      box-shadow: var(--shadow-sm);
    }

    .cit-help__category-header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-gray-100);
    }

    .cit-help__category-icon {
      font-size: 2rem;
      line-height: 1;
      flex-shrink: 0;
    }

    .cit-help__category-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-help__category-description {
      font-size: var(--font-size-xs);
      color: var(--color-gray-600);
      margin: 0;
    }

    .cit-help__items {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .cit-help__item {
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-gray-50);
    }

    .cit-help__item:last-child {
      padding-bottom: 0;
      border-bottom: none;
    }

    .cit-help__item-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-700);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-help__item-text {
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      line-height: 1.6;
      margin: 0;
    }

    .cit-help__disclaimer {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--color-navy-50);
      border: 1px solid var(--color-navy-100);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-4);
    }

    .cit-help__disclaimer p {
      font-size: var(--font-size-xs);
      color: var(--color-navy-700);
      margin: 0;
      line-height: 1.6;
    }

    .cit-help__back-row {
      text-align: center;
      margin-top: var(--space-4);
    }

    @media (max-width: 768px) {
      .cit-help {
        padding: var(--space-4);
      }

      .cit-help__quick-grid {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
);

export default CitizenHelp;
