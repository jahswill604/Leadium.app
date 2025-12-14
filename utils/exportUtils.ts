import { Lead } from '../types';

export const exportToCSV = (leads: Lead[]) => {
  if (leads.length === 0) return;

  const isB2C = leads[0].leadType === 'b2c';

  let headers: string[] = [];
  
  if (isB2C) {
    headers = [
      'Platform',
      'Post Link',
      'Sentiment / Industry',
      'Location',
      'Post Content',
      'General Info',
      'Date Posted',
      'Quality Score',
      'User Handle',
      'User Profile / Inbox Link',
      'Verified?'
    ];
  } else {
    headers = [
      'Company Name',
      'Website',
      'Industry',
      'Country',
      'Summary',
      'General Email',
      'Phone',
      'Size',
      'LinkedIn',
      'Quality Score',
      'Decision Maker 1 Name',
      'Decision Maker 1 Title',
      'Decision Maker 1 Email'
    ];
  }

  const rows = leads.map(lead => {
    if (isB2C) {
       const user = lead.decisionMakers[0] || { name: '', title: '', email: '' };
       return [
         lead.companyName, // Platform
         lead.websiteUrl,  // Post Link
         lead.industry,    // Sentiment
         lead.country,
         `"${lead.summary.replace(/"/g, '""')}"`,
         lead.generalEmail,
         lead.size, // Date
         lead.qualityScore,
         user.name,
         user.email, // Profile link stored here for B2C
         'Yes'
       ].join(',');
    } else {
       // B2B Export
       const dm1 = lead.decisionMakers[0] || { name: '', title: '', email: '' };
       return [
        lead.companyName,
        lead.websiteUrl,
        lead.industry,
        lead.country,
        `"${lead.summary.replace(/"/g, '""')}"`, 
        lead.generalEmail,
        lead.phoneNumber,
        lead.size,
        lead.linkedinUrl,
        lead.qualityScore,
        dm1.name,
        dm1.title,
        dm1.email
      ].join(',');
    }
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};