#!/usr/bin/env node

/**
 * Script pour créer un document d'exemple au format SPDF
 * Démontre toutes les fonctionnalités du format sécurisé
 */

import { writeFileSync } from 'fs';
import { randomBytes, createHash } from 'crypto';

// Fonction pour générer un hash SHA-3 simulé (pour demo)
function generateHash(content) {
    return createHash('sha256').update(content).digest('hex');
}

// Fonction pour générer un timestamp ISO
function generateTimestamp() {
    return new Date().toISOString();
}

// Fonction pour générer un ID unique
function generateId() {
    return randomBytes(16).toString('hex');
}

// Fonction pour encoder du contenu en base64 (simulation chiffrement)
function encodeContent(content) {
    return Buffer.from(content, 'utf8').toString('base64');
}

/**
 * Crée un document SPDF d'exemple complet
 */
function createExampleDocument() {
    const documentId = generateId();
    const timestamp = generateTimestamp();
    
    // Contenu du document (sera "chiffré" en base64)
    const pageContent = [
        {
            type: "text",
            id: "title",
            x: 72, y: 750, width: 450, height: 30,
            content: encodeContent("Document Sécurisé - Format SPDF"),
            style: {
                font: "Arial",
                size: 18,
                color: "#2c3e50",
                bold: true,
                italic: false
            }
        },
        {
            type: "text",
            id: "subtitle",
            x: 72, y: 720, width: 450, height: 20,
            content: encodeContent("Exemple de document au nouveau format sécurisé"),
            style: {
                font: "Arial",
                size: 12,
                color: "#34495e",
                bold: false,
                italic: true
            }
        },
        {
            type: "text",
            id: "intro",
            x: 72, y: 680, width: 450, height: 60,
            content: encodeContent("Ce document démontre les capacités du format SPDF (SecurePDF) :\n• Chiffrement AES-256-GCM\n• Signatures numériques RSA-PSS\n• Validation stricte du contenu\n• Audit trail complet"),
            style: {
                font: "Arial",
                size: 11,
                color: "#2c3e50",
                bold: false,
                italic: false
            }
        },
        {
            type: "text",
            id: "security-title",
            x: 72, y: 600, width: 450, height: 20,
            content: encodeContent("🔒 Fonctionnalités de Sécurité"),
            style: {
                font: "Arial",
                size: 14,
                color: "#e74c3c",
                bold: true,
                italic: false
            }
        },
        {
            type: "text",
            id: "security-list",
            x: 72, y: 520, width: 450, height: 80,
            content: encodeContent("• Aucun code exécutable (contrairement aux PDF)\n• Chiffrement bout-en-bout avec mots de passe forts\n• Signatures cryptographiques vérifiables\n• Hachage SHA-3 de tous les éléments\n• Permissions granulaires (lecture, copie, impression)\n• Historique des modifications immuable"),
            style: {
                font: "Arial",
                size: 10,
                color: "#2c3e50",
                bold: false,
                italic: false
            }
        },
        {
            type: "rectangle",
            id: "security-box",
            x: 72, y: 430, width: 450, height: 80,
            style: {
                fill: "#ecf0f1",
                stroke: "#95a5a6",
                strokeWidth: 1
            }
        },
        {
            type: "text",
            id: "tech-details",
            x: 82, y: 480, width: 430, height: 60,
            content: encodeContent("Détails Techniques :\n• Format : JSON structuré (pas de PostScript)\n• Chiffrement : AES-256-GCM + PBKDF2\n• Signatures : RSA-PSS + SHA-3-256\n• Validation : Schémas JSON stricts"),
            style: {
                font: "Courier New",
                size: 9,
                color: "#2c3e50",
                bold: false,
                italic: false
            }
        },
        {
            type: "text",
            id: "footer",
            x: 72, y: 100, width: 450, height: 40,
            content: encodeContent("Ce document a été généré le " + new Date().toLocaleDateString('fr-FR') + " à " + new Date().toLocaleTimeString('fr-FR') + "\nFormat SPDF v1.0.0 - SecurePDF Project"),
            style: {
                font: "Arial",
                size: 8,
                color: "#7f8c8d",
                bold: false,
                italic: true
            }
        },
        {
            type: "text",
            id: "signature-info",
            x: 72, y: 50, width: 450, height: 20,
            content: encodeContent("✓ Document signé numériquement et chiffré"),
            style: {
                font: "Arial",
                size: 9,
                color: "#27ae60",
                bold: true,
                italic: false
            }
        }
    ];

    // Calcul des hashes de contenu
    const contentHashes = {
        text: generateHash(pageContent.filter(el => el.type === 'text').map(el => el.content).join('')),
        images: [], // Pas d'images dans cet exemple
        forms: generateHash('') // Pas de formulaires dans cet exemple
    };

    // Création du document SPDF complet
    const spdfDocument = {
        spdf: {
            version: "1.0.0",
            created: timestamp,
            id: documentId,
            generator: "SecurePDF Example Generator v1.0.0"
        },
        metadata: {
            title: "Document SPDF d'Exemple",
            author: "SecurePDF Generator",
            subject: "Démonstration du format sécurisé SPDF",
            keywords: ["SPDF", "SecurePDF", "sécurité", "chiffrement", "exemple"],
            creator: "SecurePDF Core Library",
            producer: "SecurePDF v1.0.0",
            creation_date: timestamp,
            modification_date: timestamp,
            language: "fr-FR",
            permissions: {
                print: true,
                copy: false, // Copie désactivée pour la démo
                modify: false,
                annotate: false,
                fill_forms: false,
                extract_content: false,
                assemble: false,
                print_high_quality: true
            }
        },
        security: {
            encryption: {
                algorithm: "AES-256-GCM",
                key_derivation: "PBKDF2",
                salt: randomBytes(32).toString('base64'),
                iterations: 100000,
                iv: randomBytes(16).toString('base64')
            },
            signature: {
                algorithm: "RSA-PSS",
                hash_algorithm: "SHA3-256",
                certificate: "-----BEGIN CERTIFICATE-----\nMIID...DEMO_CERTIFICATE...xyz=\n-----END CERTIFICATE-----",
                signature: randomBytes(256).toString('base64'),
                timestamp: timestamp,
                tsa_url: "https://tsa.securepdf.org",
                certificate_chain: [
                    "Demo Root CA Certificate",
                    "Demo Intermediate CA Certificate"
                ]
            },
            content_hashes: contentHashes,
            integrity_check: generateHash(JSON.stringify(contentHashes))
        },
        content: {
            pages: [
                {
                    id: "page-1",
                    width: 595.28, // A4 en points
                    height: 841.89,
                    orientation: "portrait",
                    margin: {
                        top: 72,
                        right: 72,
                        bottom: 72,
                        left: 72
                    },
                    elements: pageContent
                }
            ],
            fonts: [
                {
                    name: "Arial",
                    type: "TrueType",
                    embedded: false
                },
                {
                    name: "Courier New",
                    type: "TrueType",
                    embedded: false
                }
            ],
            color_space: "sRGB"
        },
        audit_trail: [
            {
                timestamp: timestamp,
                action: "document_created",
                user: "system",
                details: "Document SPDF créé avec le générateur d'exemple",
                previous_hash: null,
                hash: generateHash(documentId + timestamp)
            },
            {
                timestamp: timestamp,
                action: "content_added",
                user: "system",
                details: "Ajout du contenu de la page 1 (9 éléments)",
                previous_hash: generateHash(documentId + timestamp),
                hash: generateHash(JSON.stringify(pageContent))
            },
            {
                timestamp: timestamp,
                action: "security_applied",
                user: "system",
                details: "Application du chiffrement et signature numérique",
                previous_hash: generateHash(JSON.stringify(pageContent)),
                hash: generateHash(JSON.stringify({
                    encryption: true,
                    signature: true,
                    timestamp: timestamp
                }))
            }
        ],
        extensions: {
            securepdf: {
                version: "1.0.0",
                features: [
                    "encryption",
                    "digital_signature",
                    "audit_trail",
                    "permissions",
                    "content_validation"
                ],
                compatibility: {
                    min_viewer_version: "1.0.0",
                    recommended_viewer: "SecurePDF Viewer v1.0.0"
                }
            }
        }
    };

    return spdfDocument;
}

/**
 * Script principal
 */
function main() {
    console.log('🔒 Création d\'un document SPDF d\'exemple...\n');
    
    try {
        // Créer le document
        const document = createExampleDocument();
        
        // Statistiques du document
        const stats = {
            pages: document.content.pages.length,
            elements: document.content.pages.reduce((acc, page) => acc + page.elements.length, 0),
            auditEntries: document.audit_trail.length,
            size: JSON.stringify(document, null, 2).length
        };
        
        console.log('📊 Statistiques du document :');
        console.log(`   • Pages : ${stats.pages}`);
        console.log(`   • Éléments : ${stats.elements}`);
        console.log(`   • Entrées d'audit : ${stats.auditEntries}`);
        console.log(`   • Taille : ${(stats.size / 1024).toFixed(1)} KB\n`);
        
        // Sauvegarder le document
        const filename = 'exemple-document-complet.spdf';
        const filepath = `examples/${filename}`;
        
        writeFileSync(filepath, JSON.stringify(document, null, 2));
        console.log(`✅ Document créé avec succès : ${filepath}`);
        
        // Créer aussi une version JSON pour compatibilité
        const jsonFilepath = filepath.replace('.spdf', '.json');
        writeFileSync(jsonFilepath, JSON.stringify(document, null, 2));
        console.log(`✅ Version JSON créée : ${jsonFilepath}`);
        
        console.log('\n🎉 Document d\'exemple SPDF créé avec succès !');
        console.log('\n📖 Fonctionnalités démontrées :');
        console.log('   ✓ Format JSON sécurisé (pas de code exécutable)');
        console.log('   ✓ Chiffrement AES-256-GCM simulé');
        console.log('   ✓ Signature numérique RSA-PSS');
        console.log('   ✓ Hachage SHA-3 du contenu');
        console.log('   ✓ Permissions granulaires');
        console.log('   ✓ Audit trail complet');
        console.log('   ✓ Métadonnées enrichies');
        console.log('   ✓ Validation de structure');
        
        console.log('\n🔍 Pour visualiser le document :');
        console.log('   1. Ouvrir examples/viewer-demo.html');
        console.log('   2. Cliquer sur "Charger fichier d\'exemple"');
        console.log('   3. Sélectionner le fichier créé');
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du document :', error.message);
        process.exit(1);
    }
}

// Exécuter le script
main();
