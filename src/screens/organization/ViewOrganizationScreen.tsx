import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Block, Text} from '../../components';
import PrimaryButton from '../../components/PrimaryButton';
import {Organization} from '../../types/organization';
import {useTheme} from '../../hooks';

interface ViewOrganizationScreenProps {
  navigation: any;
  route: any;
}

const ViewOrganizationScreen: React.FC<ViewOrganizationScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors} = useTheme();
  const {organization} = route.params || {};

  const renderField = (label: string, value?: string | boolean | string[]) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>
        {Array.isArray(value)
          ? value.join(', ')
          : typeof value === 'boolean'
          ? value
            ? 'Yes'
            : 'No'
          : value || '-'}
      </Text>
    </View>
  );

  return (
    <Block safe style={[styles.container, {backgroundColor: colors.background}]}> 
      <View
        style={[
          styles.header,
          {backgroundColor: colors.card, borderBottomColor: colors.light},
        ]}>
        <Text style={StyleSheet.flatten([styles.title, {color: colors.text}])}>
          Organization Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Master Details</Text>
          {renderField('Organization Name', organization?.organizationName)}
          {renderField('Type', organization?.organizationType)}
          {renderField('Registration Number', organization?.registrationNumber)}
          {renderField('GST', organization?.gst)}
          {renderField('Address', organization?.address)}
          {renderField('City', organization?.city)}
          {renderField('State', organization?.state)}
          {renderField('Country', organization?.country)}
          {renderField('Pincode', organization?.pincode)}
          {renderField('Contact', organization?.contactNumber)}
          {renderField('Email', organization?.email)}
          {renderField('Time Zone', organization?.timeZone)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Access & Branding</Text>
          {renderField('Organization URL', organization?.organizationUrl)}
          {renderField('Institution URL Same', organization?.institutionUrlSame)}
          {renderField('Software Website URL', organization?.softwareWebsiteUrl)}
          {renderField('Login Template', organization?.loginTemplate)}
          {renderField('Default Language', organization?.defaultLanguage)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin & Control</Text>
          {renderField('Admin Name', organization?.adminName)}
          {renderField('Admin Email', organization?.adminEmail)}
          {renderField('Admin Mobile', organization?.adminMobile)}
          {renderField('Status', organization?.status)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal & Commercial</Text>
          {renderField('MOU Copy', organization?.mouCopy)}
          {renderField('PO Number', organization?.poNumber)}
          {renderField('PO Start Date', organization?.poStartDate)}
          {renderField('PO End Date', organization?.poEndDate)}
          {renderField('Subscription Plan', organization?.subscriptionPlan)}
          {renderField('Enabled Modules', organization?.enabledModules)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Billing & Payment</Text>
          {renderField('Invoice Type', organization?.invoiceType)}
          {renderField('Invoice Frequency', organization?.invoiceFrequency)}
          {renderField('Payment Mode', organization?.paymentMode)}
          {renderField('Invoice Amount', organization?.invoiceAmount)}
          {renderField('Payment Status', organization?.paymentStatus)}
          {renderField('Payment Received', organization?.paymentReceived)}
          {renderField('Payment Date', organization?.paymentDate)}
          {renderField('Transaction Reference', organization?.transactionReference)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support & Communication</Text>
          {renderField('POC Name', organization?.pocName)}
          {renderField('POC Email', organization?.pocEmail)}
          {renderField('POC Contact', organization?.pocContact)}
          {renderField('Support SLA', organization?.supportSLA)}
        </View>

        <View style={styles.buttonRow}>
          <PrimaryButton
            title="Edit"
            onPress={() =>
              navigation.navigate('AddEditOrganization', {
                organization,
                isEditMode: true,
                onSave: route.params?.onSave,
              })
            }
            style={{flex: 1}}
          />
          <PrimaryButton
            title="Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={{flex: 1, marginLeft: 10}}
          />
        </View>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  fieldRow: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
  },
  fieldValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

export default ViewOrganizationScreen;
