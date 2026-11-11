import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { Text, Heading, Box } from '@forge/ui';

const resolver = new Resolver();

// Lógica del Agente Zero-Trust (Trigger)
export async function auditHandler(payload) {
  const issue = payload.issue;
  const statusName = issue.fields.status.name;

  // Ejecutar solo si el ticket transiciona a Done o Resolved
  if (statusName !== 'Done' && statusName !== 'Resolved') {
    return;
  }

  try {
    // Consultar Teamwork Graph (Dev Status API)
    const response = await api.asApp().requestJira(
      route`/rest/dev-status/1.0/issue/summary?issueId=${issue.id}`,
      {
        headers: { 'Accept': 'application/json' }
      }
    );

    const data = await response.json();
    const bitbucketData = data.summary?.bitbucket;

    let auditStatus = 'NO_EVIDENCE';
    let auditMessage = 'No se encontraron repositorios de Bitbucket vinculados a este ticket.';

    // Lógica de verificación Zero-Trust
    if (bitbucketData && bitbucketData.length > 0) {
      // Buscar en las ramas y Pull Requests
      const allPRs = bitbucketData.flatMap(branch => branch.pullRequests || []);
      
      const hasValidPR = allPRs.some(pr => 
        pr.state === 'MERGED' && pr.approved === true
      );

      if (hasValidPR) {
        auditStatus = 'VERIFIED';
        auditMessage = '✅ Evidencia verificada: Pull Request fusionado y aprobado en Bitbucket.';
      } else {
        auditStatus = 'UNVERIFIED';
        auditMessage = '⚠️ Evidencia incompleta: Existen commits, pero no hay un PR fusionado y aprobado.';
      }
    }

    // Actualizar el ticket de Jira con el resultado de la auditoría
    await api.asApp().requestJira(
      route`/rest/api/3/issue/${issue.key}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update: {
            comment: [
              {
                add: {
                  body: {
                    type: 'doc',
                    version: 1,
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          { type: 'text', text: `[EvidenceGraph Auditor] Estado: ${auditStatus}. ${auditMessage}` }
                        ]
                      }
                    ]
                  }
                }
              }
            ]
          }
        })
      }
    );

  } catch (error) {
    console.error('Error en la auditoría de EvidenceGraph:', error);
  }
}

// Resolver para el Panel de Jira (Frontend básico)
resolver.define('getText', (req) => {
  return 'EvidenceGraph Auditor: Sistema de verificación Zero-Trust activo.';
});

export const handler = resolver.getDefinitions();

// Exportación para el panel de UI
export function App() {
  return (
    <Box padding="space.100">
      <Heading>EvidenceGraph Auditor</Heading>
      <Text>Estado del sistema: Zero-Trust Agent activo.</Text>
      <Text>Verificando integridad entre Jira y Bitbucket.</Text>
    </Box>
  );
}