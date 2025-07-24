#!/usr/bin/env node

/**
 * Script de validation et démonstration du format SPDF
 * Vérifie la conformité et les fonctionnalités de sécurité
 */

import { readFileSync } from 'fs';
import { createHash } from 'crypto';

/**
 * Valide la structure basique d'un document SPDF
 */
function validateSpdfStructure(document) {
    const errors = [];
    const warnings = [];
    
    // Vérification des champs obligatoires
    const requiredFields = [
        'spdf',
        'metadata', 
        'security',
        'content',
        'audit_trail'
    ];
    
    for (const field of requiredFields) {
        if (!document[field]) {
            errors.push(`Champ obligatoire manquant: ${field}`);
        }
    }
    
    // Vérification de la version SPDF
    if (document.spdf) {
        if (!document.spdf.version) {
            errors.push('Version SPDF manquante');
        } else if (document.spdf.version !== '1.0.0') {
            warnings.push(`Version SPDF non standard: ${document.spdf.version}`);
        }
        
        if (!document.spdf.id) {
            errors.push('ID de document manquant');
        }
        
        if (!document.spdf.created) {
            errors.push('Date de création manquante');
        }
    }
    
    // Vérification des métadonnées
    if (document.metadata) {
        const requiredMetadata = ['title', 'author', 'permissions'];
        for (const field of requiredMetadata) {
            if (!document.metadata[field]) {
                warnings.push(`Métadonnée recommandée manquante: ${field}`);
            }
        }
        
        // Vérification des permissions
        if (document.metadata.permissions) {
            const permissionFields = ['print', 'copy', 'modify', 'annotate'];
            for (const perm of permissionFields) {
                if (typeof document.metadata.permissions[perm] !== 'boolean') {
                    warnings.push(`Permission ${perm} doit être un booléen`);
                }
            }
        }
    }
    
    // Vérification de la sécurité
    if (document.security) {
        // Chiffrement
        if (document.security.encryption) {
            const enc = document.security.encryption;
            if (enc.algorithm !== 'AES-256-GCM') {
                warnings.push(`Algorithme de chiffrement non recommandé: ${enc.algorithm}`);
            }
            if (enc.key_derivation !== 'PBKDF2') {
                warnings.push(`Dérivation de clé non recommandée: ${enc.key_derivation}`);
            }
            if (enc.iterations < 100000) {
                warnings.push(`Nombre d'itérations PBKDF2 trop faible: ${enc.iterations}`);
            }
        } else {
            warnings.push('Document non chiffré');
        }
        
        // Signature
        if (document.security.signature) {
            const sig = document.security.signature;
            if (sig.algorithm !== 'RSA-PSS') {
                warnings.push(`Algorithme de signature non recommandé: ${sig.algorithm}`);
            }
            if (!sig.hash_algorithm || !sig.hash_algorithm.startsWith('SHA3')) {
                warnings.push('Utilisation de SHA-3 recommandée pour les signatures');
            }
        } else {
            warnings.push('Document non signé');
        }
        
        // Hashes de contenu
        if (!document.security.content_hashes) {
            errors.push('Hashes de contenu manquants');
        }
    }
    
    // Vérification du contenu
    if (document.content) {
        if (!document.content.pages || document.content.pages.length === 0) {
            errors.push('Aucune page trouvée dans le document');
        } else {
            // Vérification des pages
            document.content.pages.forEach((page, index) => {
                if (!page.id) {
                    warnings.push(`Page ${index + 1} sans ID`);
                }
                if (!page.elements || page.elements.length === 0) {
                    warnings.push(`Page ${index + 1} sans éléments`);
                }
                
                // Vérification des éléments
                if (page.elements) {
                    page.elements.forEach((element, elemIndex) => {
                        if (!element.type) {
                            errors.push(`Élément ${elemIndex + 1} de la page ${index + 1} sans type`);
                        }
                        if (!element.id) {
                            warnings.push(`Élément ${elemIndex + 1} de la page ${index + 1} sans ID`);
                        }
                    });
                }
            });
        }
    }
    
    // Vérification de l'audit trail
    if (document.audit_trail) {
        if (document.audit_trail.length === 0) {
            warnings.push('Audit trail vide');
        } else {
            // Vérifier la chaîne des hashes
            let previousHash = null;
            document.audit_trail.forEach((entry, index) => {
                if (!entry.timestamp) {
                    warnings.push(`Entrée d'audit ${index + 1} sans timestamp`);
                }
                if (!entry.action) {
                    warnings.push(`Entrée d'audit ${index + 1} sans action`);
                }
                if (!entry.hash) {
                    warnings.push(`Entrée d'audit ${index + 1} sans hash`);
                }
                
                if (index > 0 && entry.previous_hash !== previousHash) {
                    warnings.push(`Chaîne de hash rompue à l'entrée ${index + 1}`);
                }
                
                previousHash = entry.hash;
            });
        }
    }
    
    return { errors, warnings };
}

/**
 * Analyse la sécurité du document
 */
function analyzeDocumentSecurity(document) {
    const securityScore = { score: 0, maxScore: 100, details: [] };
    
    // Chiffrement (30 points)
    if (document.security?.encryption) {
        if (document.security.encryption.algorithm === 'AES-256-GCM') {
            securityScore.score += 20;
            securityScore.details.push('✓ Chiffrement AES-256-GCM (+20)');
        } else {
            securityScore.score += 10;
            securityScore.details.push('⚠ Chiffrement faible (+10)');
        }
        
        if (document.security.encryption.iterations >= 100000) {
            securityScore.score += 10;
            securityScore.details.push('✓ PBKDF2 iterations suffisantes (+10)');
        } else {
            securityScore.score += 5;
            securityScore.details.push('⚠ PBKDF2 iterations faibles (+5)');
        }
    } else {
        securityScore.details.push('✗ Aucun chiffrement (0)');
    }
    
    // Signature numérique (25 points)
    if (document.security?.signature) {
        if (document.security.signature.algorithm === 'RSA-PSS') {
            securityScore.score += 15;
            securityScore.details.push('✓ Signature RSA-PSS (+15)');
        } else {
            securityScore.score += 8;
            securityScore.details.push('⚠ Signature faible (+8)');
        }
        
        if (document.security.signature.hash_algorithm?.startsWith('SHA3')) {
            securityScore.score += 10;
            securityScore.details.push('✓ Hash SHA-3 (+10)');
        } else {
            securityScore.score += 5;
            securityScore.details.push('⚠ Hash non optimal (+5)');
        }
    } else {
        securityScore.details.push('✗ Aucune signature (0)');
    }
    
    // Intégrité (20 points)
    if (document.security?.content_hashes) {
        securityScore.score += 15;
        securityScore.details.push('✓ Hashes de contenu (+15)');
        
        if (document.security.integrity_check) {
            securityScore.score += 5;
            securityScore.details.push('✓ Vérification d\'intégrité (+5)');
        }
    } else {
        securityScore.details.push('✗ Aucun hash de contenu (0)');
    }
    
    // Permissions (15 points)
    if (document.metadata?.permissions) {
        const perms = document.metadata.permissions;
        let permScore = 0;
        
        if (perms.copy === false) permScore += 3;
        if (perms.modify === false) permScore += 3;
        if (perms.extract_content === false) permScore += 3;
        if (perms.annotate === false) permScore += 3;
        if (perms.assemble === false) permScore += 3;
        
        securityScore.score += permScore;
        securityScore.details.push(`✓ Permissions restrictives (+${permScore})`);
    } else {
        securityScore.details.push('⚠ Aucune restriction de permissions (0)');
    }
    
    // Audit trail (10 points)
    if (document.audit_trail?.length > 0) {
        securityScore.score += 10;
        securityScore.details.push('✓ Audit trail présent (+10)');
    } else {
        securityScore.details.push('⚠ Aucun audit trail (0)');
    }
    
    return securityScore;
}

/**
 * Affiche les informations du document
 */
function displayDocumentInfo(document) {
    console.log('📄 Informations du Document');
    console.log('═'.repeat(50));
    
    if (document.spdf) {
        console.log(`   Version SPDF : ${document.spdf.version}`);
        console.log(`   ID : ${document.spdf.id}`);
        console.log(`   Créé : ${new Date(document.spdf.created).toLocaleString('fr-FR')}`);
        if (document.spdf.generator) {
            console.log(`   Générateur : ${document.spdf.generator}`);
        }
    }
    
    if (document.metadata) {
        console.log(`   Titre : ${document.metadata.title || 'Non spécifié'}`);
        console.log(`   Auteur : ${document.metadata.author || 'Non spécifié'}`);
        console.log(`   Sujet : ${document.metadata.subject || 'Non spécifié'}`);
        if (document.metadata.keywords?.length > 0) {
            console.log(`   Mots-clés : ${document.metadata.keywords.join(', ')}`);
        }
    }
    
    if (document.content) {
        const pageCount = document.content.pages?.length || 0;
        const elementCount = document.content.pages?.reduce((acc, page) => acc + (page.elements?.length || 0), 0) || 0;
        console.log(`   Pages : ${pageCount}`);
        console.log(`   Éléments : ${elementCount}`);
    }
    
    console.log('');
}

/**
 * Script principal
 */
function main() {
    const filename = process.argv[2] || 'examples/exemple-document-complet.spdf';
    
    console.log('🔍 Validation du Document SPDF');
    console.log('═'.repeat(50));
    console.log(`📂 Fichier : ${filename}\n`);
    
    try {
        // Charger le document
        const documentData = readFileSync(filename, 'utf8');
        const document = JSON.parse(documentData);
        
        // Afficher les informations de base
        displayDocumentInfo(document);
        
        // Validation de la structure
        console.log('🔧 Validation de la Structure');
        console.log('═'.repeat(50));
        
        const validation = validateSpdfStructure(document);
        
        if (validation.errors.length === 0) {
            console.log('✅ Structure valide');
        } else {
            console.log('❌ Erreurs de structure :');
            validation.errors.forEach(error => console.log(`   • ${error}`));
        }
        
        if (validation.warnings.length > 0) {
            console.log('⚠️  Avertissements :');
            validation.warnings.forEach(warning => console.log(`   • ${warning}`));
        }
        
        console.log('');
        
        // Analyse de sécurité
        console.log('🔒 Analyse de Sécurité');
        console.log('═'.repeat(50));
        
        const securityAnalysis = analyzeDocumentSecurity(document);
        
        console.log(`Score de sécurité : ${securityAnalysis.score}/${securityAnalysis.maxScore}`);
        
        let level = 'Faible';
        if (securityAnalysis.score >= 80) level = 'Excellent';
        else if (securityAnalysis.score >= 60) level = 'Bon';
        else if (securityAnalysis.score >= 40) level = 'Moyen';
        
        console.log(`Niveau de sécurité : ${level}`);
        console.log('');
        
        securityAnalysis.details.forEach(detail => {
            console.log(`   ${detail}`);
        });
        
        console.log('');
        
        // Statistiques détaillées
        console.log('📊 Statistiques Détaillées');
        console.log('═'.repeat(50));
        
        const stats = {
            jsonSize: documentData.length,
            auditEntries: document.audit_trail?.length || 0,
            hasEncryption: !!document.security?.encryption,
            hasSignature: !!document.security?.signature,
            permissionsCount: document.metadata?.permissions ? Object.keys(document.metadata.permissions).length : 0
        };
        
        console.log(`   Taille JSON : ${(stats.jsonSize / 1024).toFixed(1)} KB`);
        console.log(`   Entrées d'audit : ${stats.auditEntries}`);
        console.log(`   Chiffré : ${stats.hasEncryption ? 'Oui' : 'Non'}`);
        console.log(`   Signé : ${stats.hasSignature ? 'Oui' : 'Non'}`);
        console.log(`   Permissions définies : ${stats.permissionsCount}`);
        
        if (validation.errors.length === 0) {
            console.log('\n✅ Document SPDF valide et prêt à être utilisé !');
        } else {
            console.log('\n❌ Document SPDF invalide, des corrections sont nécessaires.');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la validation :', error.message);
        
        if (error.message.includes('JSON')) {
            console.error('   Le fichier ne semble pas être un JSON valide.');
        } else if (error.code === 'ENOENT') {
            console.error('   Le fichier n\'existe pas.');
            console.log('\n💡 Utilisez d\'abord :');
            console.log('   node examples/create-example-document.js');
        }
        
        process.exit(1);
    }
}

// Exécuter le script
main();
