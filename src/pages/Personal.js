import React from 'react';
import { Users } from 'lucide-react';
import PageHeader from '../components/Common/PageHeader';
import Card from '../components/Common/Card';

const Personal = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Personal"
                subtitle="Administra el personal de la parroquia"
                icon={Users}
            />

            <Card>
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Personal</h3>
                    <p className="text-gray-600">Administra la información del personal de la parroquia.</p>
                </div>
            </Card>
        </div>
    );
};

export default Personal;