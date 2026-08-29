"""create_complaints_and_inspections_tables

Revision ID: d25ff94ee1ac
Revises: 474418e77751
Create Date: 2026-08-29 21:20:13.876272

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd25ff94ee1ac'
down_revision: Union[str, Sequence[str], None] = '474418e77751'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('users') as batch_op:
        batch_op.alter_column('role', existing_type=sa.VARCHAR(length=12), type_=sa.String(length=20), existing_nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('users') as batch_op:
        batch_op.alter_column('role', existing_type=sa.String(length=20), type_=sa.VARCHAR(length=12), existing_nullable=False)
