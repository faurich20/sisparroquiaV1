import React from 'react';
import { Settings } from 'lucide-react';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const PermissionsPage = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Permisos"
                subtitle="Configura los permisos del sistema"
                icon={Settings}
            />

            <Card>
                <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Permisos</h3>
                    <p className="text-gray-600">Configura los permisos específicos para cada rol del sistema.</p>
                </div>
            </Card>
        </div>
    );
};

export default PermissionsPage;